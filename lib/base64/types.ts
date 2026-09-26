export type Base64Mode = "encode" | "decode";
export type Base64InputType = "text" | "file";
export interface Base64Options {
  urlSafe: boolean;
  wrap76: boolean;
}
export type Base64Status =
  | { kind: "idle" }
  | { kind: "valid"; inputBytes: number; outputBytes: number }
  | { kind: "invalid"; reason: string }
  | { kind: "error"; message: string };
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
