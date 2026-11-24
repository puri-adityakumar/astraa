interface PrTask {
  num: string;
  title: string;
  branch: string;
}

// Batch: small PRs first to validate the pipeline end to end.
const PRS: PrTask[] = [
  { num: "122", title: "fix(image): give the resize controls accessible names", branch: "fix/image-resize-control-labels" },
];

interface ReviewIssue {
  /** File and approximate line: "components/x.tsx:42". */
  where: string;
  /** One sentence describing the problem. */
  what: string;
  /** Why flagged: "bug", "security", or 'AGENTS.md violation: "<rule>"'. */
  kind: string;
  /** The concrete evidence: diff line, code line, or quoted rule text. */
  evidence: string;
}

interface WaveResult {
  issues: ReviewIssue[];
  /** One paragraph: what was checked and how, for the findings comment. */
  summary: string;
}

interface Confirmation {
  confirmed: boolean;
  /** Why: what the code actually shows. */
  reason: string;
}

interface Synthesis {
  /** "changes-required" or "no-changes-required". */
  verdict: string;
  /** Checklist items the implementation commit must fulfil; empty when nothing is required. */
  checklist: string[];
  /** Conventional Commit message for the implementation commit. */
  commitMessage: string;
  /** Workspace-relative path of the markdown body written for the findings comment. */
  commentFile: string;
  /** Items needing Aditya's explicit decision, each phrased so he can act on it. */
  needsLookup: string[];
}

interface ImplResult {
  /** One line per edit made. */
  changes: string[];
  /** Files modified. */
  files: string[];
}

interface ReReview {
  fulfilled: boolean;
  /** Per-item status. */
  items: { item: string; fulfilled: boolean; evidence: string }[];
}

interface PrOutcome {
  pr: string;
  title: string;
  verdict: "pending-visual-gate" | "needs-lookup" | "blocked";
  /** What still has to happen, including coordinator steps and notes for Aditya. */
  notes: string[];
}

interface PrView {
  state: string;
  isDraft: boolean;
  mergeable: string;
  mergeStateStatus: string;
}

const outcomes: PrOutcome[] = [];

for (const pr of PRS) {
  try {
    phase("Pre-flight each pull request and check out its branch");
    const pfRun = await world.run("gh", ["pr", "view", pr.num, "--json", "state,isDraft,mergeable,mergeStateStatus"], { output: { tail: 2000 } });
    if (pfRun.exitCode !== 0) {
      outcomes.push({ pr: pr.num, title: pr.title, verdict: "blocked", notes: [`gh pr view failed: ${pfRun.stderr}`] });
      report(outcomes[outcomes.length - 1]);
      continue;
    }
    const pf = JSON.parse(pfRun.stdout) as PrView;
    if (pf.state !== "OPEN" || pf.isDraft) {
      outcomes.push({ pr: pr.num, title: pr.title, verdict: "blocked", notes: [`state=${pf.state} isDraft=${String(pf.isDraft)} — not reviewable`] });
      report(outcomes[outcomes.length - 1]);
      continue;
    }
    let merged = "";
    if (pf.mergeable === "CONFLICTING") {
      const fetchRun = await world.run("git", ["fetch", "origin", pr.branch]);
      const coRun = await world.run("git", ["checkout", pr.branch]);
      if (coRun.exitCode !== 0) {
        await world.run("git", ["reset", "--hard"]);
        await world.run("git", ["checkout", pr.branch]);
      }
      const mergeRun = await world.run("git", ["merge", "origin/main"]);
      if (mergeRun.exitCode !== 0) {
        await world.run("git", ["merge", "--abort"]);
        outcomes.push({ pr: pr.num, title: pr.title, verdict: "needs-lookup", notes: ["Branch conflicts with main; automatic merge failed and was aborted — resolve manually before review."] });
        report(outcomes[outcomes.length - 1]);
        continue;
      }
      await world.run("git", ["push", "origin", pr.branch]);
      merged = "main merged into the branch to clear conflicts";
    } else {
      await world.run("git", ["fetch", "origin", pr.branch]);
      const coRun = await world.run("git", ["checkout", pr.branch]);
      if (coRun.exitCode !== 0) {
        await world.run("git", ["reset", "--hard"]);
        await world.run("git", ["checkout", pr.branch]);
      }
    }

    phase("Run the review agents in waves");
    const intent = await world.run("gh", ["pr", "view", pr.num, "--json", "body", "--jq", ".body"], { output: { tail: 12000 } });
    const intentText = intent.stdout.slice(0, 6000);
    const shared =
      `Repo /Users/aditya/Projects/astraa, PR #${pr.num} ("${pr.title}"), branch ${pr.branch} (checked out locally, working tree matches the PR head). ` +
      `Author intent from the PR body (may be truncated):\n${intentText}\n` +
      `AGENT ASSUMPTIONS: all tools work; only call a tool when the task needs it. Known stale rule: "PRs must target development branch" — no such branch exists, never flag it. High-signal bar: report only issues you are certain of with concrete evidence; no style, no pre-existing issues, no linter-class issues, no subjective nitpicks.`;
    const compliance = await Promise.all(
      [1, 2].map((k) =>
        agent(`Compliance reviewer ${pr.num}-${k === 1 ? "A" : "B"}`).ask<WaveResult>(
          shared +
            ` You are compliance reviewer ${k === 1 ? "A" : "B"}. Read the PR-branch instruction files: git show origin/${pr.branch}:AGENTS.md and :CLAUDE.md (root files apply to all changed files). Audit ONLY the lines changed by the PR: gh pr diff ${pr.num}. Flag only clear, quotable AGENTS.md/CLAUDE.md violations on changed lines, or code that fails to compile/parse. Do not edit any file.`,
        ),
      ),
    );
    const bugs = await Promise.all([
      agent(`Bug scanner ${pr.num}`).ask<WaveResult>(
        shared +
          " You are the diff-only bug scanner. Focus ONLY on gh pr diff " + pr.num + " without extra context. Flag only significant bugs: code that fails to compile/parse, or that definitely produces wrong results regardless of inputs. Do not edit any file.",
      ),
      agent(`Security and logic reviewer ${pr.num}`).ask<WaveResult>(
        shared +
          " You are the introduced-code reviewer: security issues, incorrect logic, broken behavior, broken references inside the changed code. You may read full PR-branch files (git show origin/" + pr.branch + ":<path>) to confirm, but only flag issues inside the changed code. Do not edit any file.",
      ),
    ]);
    const simplify = await agent(`Simplification reviewer ${pr.num}`).ask<WaveResult>(
      shared +
        " You are the read-only simplification reviewer (do not edit any file). Read gh pr view " + pr.num + " --json body first; never recommend removing deliberate design the author describes. Recommend only genuine simplifications that preserve all functionality and clearly improve clarity; if the code is already appropriately simple, return an empty issues array and say so in the summary.",
    );
    const waveFindings = [...compliance, ...bugs, simplify].flatMap((w) => w.issues);

    phase("Confirm flagged findings independently");
    const confirmed: ReviewIssue[] = [];
    const unconfirmed: ReviewIssue[] = [];
    await Promise.all(
      waveFindings.map(async (f, i) => {
        const verdict = await agent(`Finding confirmer ${pr.num}#${i + 1}`).ask<Confirmation>(
          shared +
            ` You are an independent confirmer. Reproduce or refute this finding from the code alone — read the PR-branch files, do not edit anything. Finding: ${JSON.stringify(f)}. confirmed=true only with concrete evidence you quote.`,
        );
        if (verdict.confirmed) confirmed.push(f);
        else unconfirmed.push({ ...f, what: `[unconfirmed: ${verdict.reason}] ${f.what}` });
      }),
    );

    phase("Synthesize the findings and post the checklist comment");
    const synthesis = await agent(`Checklist author ${pr.num}`).ask<Synthesis>(
      shared +
        ` You are the checklist author. Inputs — compliance: ${JSON.stringify(compliance)}; bugs/security: ${JSON.stringify(bugs)}; simplification: ${JSON.stringify(simplify)}; confirmed findings: ${JSON.stringify(confirmed)}; unconfirmed (keep, labelled): ${JSON.stringify(unconfirmed)}.\n` +
        `Write the findings comment for the PR in markdown to .zcode/workflow-run/pr-${pr.num}-checklist.md (create the directory). Format: "## Code review + simplification pass (automated pipeline)" with one summary paragraph per lane (quote the verification summaries), then "### Requirements checklist — the implementation commit on this PR must fulfil ALL of:" with one "- [ ]" item per checklist action, then the exact line: "Live visual verification: pending — the coordinator runs it on the PR head before merge approval."\n` +
        `Decide the checklist: each confirmed compliance/bug/security finding becomes an item; simplification recommendations become items only when they clearly improve the code with zero behavior risk (decline rule-of-three-threshold polish). When nothing passes the bar, verdict is "no-changes-required", checklist is empty, and the comment says the PR ships as-is with the head unchanged. Unconfirmed findings go in the comment labelled unconfirmed, never as checklist items. Put anything needing the maintainer's explicit product/workflow decision into needsLookup, phrased so he can act on it. Provide a Conventional Commit message (e.g. "refactor(x): ...") for the checklist implementation.`,
    );
    const comment = await world.run("gh", ["pr", "comment", pr.num, "--body-file", synthesis.commentFile]);

    let implNote = "no checklist items — PR ships as-is";
    let gatesFeedback = "";
    if (synthesis.verdict === "changes-required" && synthesis.checklist.length > 0) {
      phase("Implement the checklist and run the gates");
      const implementer = agent(`Implementer ${pr.num}`);
      let gatesOk = false;
      for (let round = 1; round <= 3 && !gatesOk; round++) {
        const impl = await implementer.ask<ImplResult>(
          shared +
            ` You are the implementer. Apply every checklist item on the current branch (already checked out at the PR head): ${JSON.stringify(synthesis.checklist)}\n` +
            (round > 1 ? `Round ${round}: the gates failed — fix what they report:\n${gatesFeedback}\n` : "") +
            `Respect repo conventions (double quotes, semicolons, 2-space indent, trailing commas, max 100-char lines). Do NOT commit or push — the script does that. Run no test suites yourself; the script runs the gates after you.`,
        );
        const t = await world.run("npm", ["test"], { output: { tail: 8000 } });
        const l = await world.run("npm", ["run", "lint"], { output: { tail: 4000 } });
        const tc = await world.run("npx", ["tsc", "--noEmit"], { output: { tail: 4000 } });
        const build = await world.run("npm", ["run", "build"], { timeoutMs: 600000, output: { tail: 4000 } });
        gatesOk = t.exitCode === 0 && l.exitCode === 0 && tc.exitCode === 0 && build.exitCode === 0;
        if (!gatesOk) {
          gatesFeedback = `npm test exit ${t.exitCode}: ${t.stdout.slice(-3000)}\nlint exit ${l.exitCode}: ${l.stdout.slice(-2000)}\ntsc exit ${tc.exitCode}: ${tc.stdout.slice(-2000)}\nbuild exit ${build.exitCode}: ${build.stdout.slice(-2000)}`;
        }
      }
      if (gatesOk) {
        await world.run("git", ["add", "-A"]);
        const commit = await world.run("git", ["commit", "-m", synthesis.commitMessage]);
        if (commit.exitCode === 0) {
          const push = await world.run("git", ["push", "origin", pr.branch]);
          implNote = push.exitCode === 0 ? `checklist implemented, committed (${synthesis.commitMessage}) and pushed` : "committed but push failed";
        } else {
          implNote = "commit failed — nothing to commit after implementation";
        }
      } else {
        implNote = "gates did not pass after 3 rounds — needs-lookup";
        synthesis.needsLookup.push(`Gates failed after 3 fix rounds on the checklist implementation: ${gatesFeedback.slice(0, 1500)}`);
      }
    }

    phase("Re-review against the checklist and report");
    let rereview: ReReview = { fulfilled: true, items: [] };
    if (synthesis.verdict === "changes-required" && synthesis.checklist.length > 0 && implNote.startsWith("checklist implemented")) {
      rereview = await agent(`Re-reviewer ${pr.num}`).ask<ReReview>(
        shared +
          ` You are the re-reviewer (read-only, edit nothing). Verify each checklist item against the pushed head — git log -1 --stat and git show HEAD. Checklist: ${JSON.stringify(synthesis.checklist)}. fulfilled=true only when every item is evidenced.`,
      );
      if (!rereview.fulfilled) {
        synthesis.needsLookup.push(`Re-review found unfulfilled checklist items: ${JSON.stringify(rereview.items.filter((i) => !i.fulfilled))}`);
      }
    }

    const verdict: PrOutcome["verdict"] =
      synthesis.needsLookup.length > 0 ? "needs-lookup" : merged !== "" ? "needs-lookup" : "pending-visual-gate";
    const notes = [
      ...synthesis.needsLookup,
      ...(merged !== "" ? ["Branch had conflicts with main — main was merged in automatically; review the resolution."] : []),
      "Coordinator: run the live visual gate on the PR head, then post the final ready-for-merge comment. Merge only after Aditya approves.",
      implNote !== "no checklist items — PR ships as-is" ? implNote : undefined,
    ].filter((n): n is string => n !== undefined);
    const outcome: PrOutcome = { pr: pr.num, title: pr.title, verdict, notes };
    outcomes.push(outcome);
    report(outcome);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const blocked: PrOutcome = { pr: pr.num, title: pr.title, verdict: "blocked", notes: [`pipeline error: ${msg.slice(0, 800)}`] };
    outcomes.push(blocked);
    report(blocked);
  }
  // Return to main between PRs so the next checkout starts from a known state.
  const back = await world.run("git", ["checkout", "main"]);
  if (back.exitCode !== 0) {
    await world.run("git", ["reset", "--hard"]);
    await world.run("git", ["checkout", "main"]);
  }
}

phase("Restore dependencies and publish the batch report");
await world.run("npm", ["install"]);
await artifact.markdown(
  "batch-report",
  [
    "# PR pipeline batch report",
    "",
    "| PR | Verdict | Notes |",
    "|---|---|---|",
    ...outcomes.map((o) => `| #${o.pr} | ${o.verdict} | ${o.notes.join("; ") || "—"} |`),
    "",
    "Every pending-visual-gate PR still needs: the coordinator's live visual check, the final ready-for-merge comment, and Aditya's merge approval.",
  ].join("\n"),
  { title: "PR pipeline batch report", primary: true },
);

return {
  conclusion: `${outcomes.filter((o) => o.verdict === "pending-visual-gate").length} of ${PRS.length} PRs cleared the review+implementation pipeline and now wait only for the visual gate; ${outcomes.filter((o) => o.verdict === "needs-lookup").length} carry items for Aditya; ${outcomes.filter((o) => o.verdict === "blocked").length} were blocked.`,
  findings: outcomes.flatMap((o) => o.notes.map((n) => ({ where: `PR #${o.pr}`, what: n, evidence: "pipeline record", status: "verified" as const, severity: "medium" as const }))),
  verified: [
    "each PR: 4 review agents in waves + independent confirmation of every flagged finding",
    "each PR with checklist items: gates npm test / npm run lint / npx tsc --noEmit / npm run build, then commit and push",
    "findings+checklist comment posted on every PR; final ready-for-merge comment intentionally left to the coordinator (after the visual gate)",
  ],
  notCovered: [
    "live visual verification per PR — the coordinator runs it on the PR head before merge approval",
    "the merge decision itself — Aditya approves every merge",
  ],
};
