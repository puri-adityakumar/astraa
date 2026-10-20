import { describe, expect, it } from "vitest";
import { SPONSOR, SPONSOR_CONTACT_HREF } from "./sponsor";

describe("terminal sponsorship", () => {
  it("starts without an active sponsor", () => {
    expect(SPONSOR).toBeNull();
  });

  it("sends sponsor enquiries to the contribution page", () => {
    expect(SPONSOR_CONTACT_HREF).toBe("/contribute");
  });
});
