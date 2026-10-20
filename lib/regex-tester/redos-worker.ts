/// <reference lib="webworker" />

import { compileRegex } from "./compile";
import { runMatches } from "./match";
import { applyReplace } from "./replace";
import { runMiniTests } from "./tests-runner";
import type { RegexWorkerRequest, RegexWorkerResponse } from "./redos-protocol";

self.onmessage = (event: MessageEvent<RegexWorkerRequest>) => {
  const request = event.data;
  let response: RegexWorkerResponse;
  try {
    const compiled = compileRegex(request.pattern, request.flags);
    if (request.type === "tests") {
      response = {
        type: "done",
        result: runMiniTests(compiled.ok ? compiled.regex : null, request.tests),
      };
    } else if (!compiled.ok) {
      response = { type: "error", error: compiled.error };
    } else {
      response = {
        type: "done",
        result: request.type === "replace"
          ? applyReplace(compiled.regex, request.input, request.replacement)
          : runMatches(compiled.regex, request.input),
      };
    }
  } catch (error) {
    response = { type: "error", error: error instanceof Error ? error.message : String(error) };
  }
  self.postMessage(response);
};
