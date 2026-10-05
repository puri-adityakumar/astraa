import { describe, expect, it } from "vitest";
import {
  closePanelTransition,
  homeDocTitle,
  openPanelTransition,
  PANEL_STATE_KEY,
  popstatePanel,
  toolDocTitle,
} from "./panel-history";

describe("openPanelTransition", () => {
  it("pushes when opening from home", () => {
    expect(openPanelTransition(null, "calculator")).toEqual({
      kind: "push",
      url: "/tools/calculator",
      state: { [PANEL_STATE_KEY]: "calculator" },
      title: "Scientific Calculator | Astraa",
      panel: "calculator",
    });
  });

  it("does nothing when the same panel is already open", () => {
    expect(openPanelTransition("calculator", "calculator").kind).toBe("none");
  });

  it("replaces when switching from one panel to another", () => {
    expect(openPanelTransition("calculator", "units")).toEqual({
      kind: "replace",
      url: "/tools/units",
      state: { [PANEL_STATE_KEY]: "units" },
      title: "Unit Converter | Astraa",
      panel: "units",
    });
  });
});

describe("closePanelTransition", () => {
  it("backs out of an entry we pushed", () => {
    expect(closePanelTransition(true)).toEqual({
      kind: "back",
      panel: null,
      title: homeDocTitle(),
    });
  });

  it("replaces to / when the entry was not pushed (direct load)", () => {
    expect(closePanelTransition(false)).toEqual({
      kind: "replace",
      url: "/",
      state: {},
      title: homeDocTitle(),
      panel: null,
    });
  });
});

describe("popstatePanel", () => {
  it("opens the panel for entries carrying panel state", () => {
    expect(popstatePanel({ [PANEL_STATE_KEY]: "calculator" })).toEqual({
      panel: "calculator",
      pushed: true,
      title: "Scientific Calculator | Astraa",
    });
  });

  it("closes for entries without panel state", () => {
    expect(popstatePanel(null).panel).toBeNull();
    expect(popstatePanel({}).panel).toBeNull();
    expect(popstatePanel({ [PANEL_STATE_KEY]: "garbage" }).panel).toBeNull();
    expect(popstatePanel(null).pushed).toBe(false);
  });
});

describe("document titles from shared metadata", () => {
  it("renders the tool title through the root layout template", () => {
    expect(toolDocTitle("calculator")).toBe("Scientific Calculator | Astraa");
  });

  it("uses the home metadata absolute title", () => {
    expect(homeDocTitle()).toBe(
      "Free Online Utility Tools for Developers & Creators",
    );
  });
});
