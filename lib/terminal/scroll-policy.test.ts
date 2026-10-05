import { describe, expect, it } from "vitest";
import { scrollAction } from "./scroll-policy";

describe("scrollAction", () => {
  it("keeps a fresh empty home at the top", () => {
    expect(
      scrollAction({ panelOpen: false, panelChanged: false, hasEntries: false }),
    ).toBe("top");
  });

  it("keeps the home at the top after /clear", () => {
    // /clear empties the entries and closes the panel in one commit.
    expect(
      scrollAction({ panelOpen: false, panelChanged: true, hasEntries: false }),
    ).toBe("top");
  });

  it("keeps an empty home at the top when a panel closes", () => {
    expect(
      scrollAction({ panelOpen: false, panelChanged: true, hasEntries: false }),
    ).toBe("top");
  });

  it("chases the bottom when an answer lands in nonempty scrollback", () => {
    expect(
      scrollAction({ panelOpen: false, panelChanged: false, hasEntries: true }),
    ).toBe("bottom");
  });

  it("chases the bottom when a panel closes onto remaining scrollback", () => {
    expect(
      scrollAction({ panelOpen: false, panelChanged: true, hasEntries: true }),
    ).toBe("bottom");
  });

  it("scrolls a newly opened or switched panel to the top of the column", () => {
    expect(
      scrollAction({ panelOpen: true, panelChanged: true, hasEntries: false }),
    ).toBe("panel");
    expect(
      scrollAction({ panelOpen: true, panelChanged: true, hasEntries: true }),
    ).toBe("panel");
  });

  it("never scroll-jacks while a panel stays open", () => {
    expect(
      scrollAction({ panelOpen: true, panelChanged: false, hasEntries: true }),
    ).toBe("none");
  });

  it("does not scroll a directly loaded panel", () => {
    expect(
      scrollAction({ panelOpen: true, panelChanged: false, hasEntries: false }),
    ).toBe("none");
  });
});
