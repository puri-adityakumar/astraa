import { describe, it, expect } from "vitest";
import {
  measuredExportSize,
  selectedExportSize,
  fittedDisplaySize,
} from "./capture";
import { DEFAULT_STATE } from "./defaults";

describe("measuredExportSize (legacy branch)", () => {
  it("multiplies the measured display bounds by the scale", () => {
    expect(measuredExportSize(400, 225, 1)).toEqual({ width: 400, height: 225 });
    expect(measuredExportSize(400, 225, 2)).toEqual({ width: 800, height: 450 });
  });

  it("keeps the unrounded float math of the current exporter", () => {
    expect(measuredExportSize(888, 499.5, 2)).toEqual({ width: 1776, height: 999 });
    expect(measuredExportSize(719.5, 404.75, 1)).toEqual({
      width: 719.5,
      height: 404.75,
    });
  });
});

describe("selectedExportSize (terminal branch)", () => {
  it("uses the selected composition size times the scale", () => {
    expect(selectedExportSize({ w: 1200, h: 675 }, 1)).toEqual({
      width: 1200,
      height: 675,
    });
    expect(selectedExportSize({ w: 1200, h: 675 }, 2)).toEqual({
      width: 2400,
      height: 1350,
    });
  });

  it("is independent of any display/viewport bounds", () => {
    const aspect = { w: 1080, h: 1920 };
    expect(selectedExportSize(aspect, 1)).toEqual({ width: 1080, height: 1920 });
    expect(selectedExportSize(aspect, 2)).toEqual({ width: 2160, height: 3840 });
  });

  it("matches the default snippet selection", () => {
    expect(selectedExportSize(DEFAULT_STATE.aspect, 2)).toEqual({
      width: 2400,
      height: 1350,
    });
  });
});

describe("fittedDisplaySize (terminal display wrapper)", () => {
  const ASPECT = { w: 1200, h: 675 };

  it("fits the composition to the host width", () => {
    expect(fittedDisplaySize(720, 560, ASPECT)).toEqual({
      width: 720,
      height: 405,
      scale: 0.6,
    });
    expect(fittedDisplaySize(343, 560, ASPECT)).toEqual({
      width: 343,
      height: 192.9375,
      scale: 343 / 1200,
    });
  });

  it("caps the display height for tall compositions", () => {
    const fit = fittedDisplaySize(720, 560, { w: 1080, h: 1920 });
    expect(fit.height).toBe(560);
    expect(fit.width).toBeCloseTo((560 / 1920) * 1080, 10);
    expect(fit.scale).toBeCloseTo(560 / 1920, 10);
  });

  it("never upscales a small composition past its natural size", () => {
    expect(fittedDisplaySize(720, 560, { w: 400, h: 300 })).toEqual({
      width: 400,
      height: 300,
      scale: 1,
    });
  });

  it("returns a zero fit before the host has been measured", () => {
    expect(fittedDisplaySize(0, 560, ASPECT)).toEqual({
      width: 0,
      height: 0,
      scale: 0,
    });
  });
});
