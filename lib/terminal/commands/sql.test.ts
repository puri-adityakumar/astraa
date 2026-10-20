import { describe, expect, it } from "vitest";
import { sqlCommand } from "@/lib/terminal/commands/sql";
import type { CommandContext } from "@/lib/terminal/types";

const ctx: CommandContext = { theme: "auto", commands: [sqlCommand] };

describe("sqlCommand", () => {
  it("is registered under the sql slug as coming soon", () => {
    expect(sqlCommand.name).toBe("sql");
    expect(sqlCommand.aliases).toEqual([]);
    expect(sqlCommand.slug).toBe("sql");
    expect(sqlCommand.status).toBe("coming-soon");
    expect(sqlCommand.category).toBe("Developer Tools");
  });

  it("answers the coming-soon line for bare args", () => {
    expect(sqlCommand.run("", ctx)).toEqual({
      type: "answer",
      output: [{ type: "text", text: "SQL is coming soon." }],
    });
  });

  it("answers the same coming-soon line and ignores args", () => {
    expect(sqlCommand.run("SELECT * FROM users", ctx)).toEqual({
      type: "answer",
      output: [{ type: "text", text: "SQL is coming soon." }],
    });
  });

  it("never opens a panel or falls back", () => {
    for (const args of ["", "SELECT 1", "   "]) {
      const result = sqlCommand.run(args, ctx);
      if (result instanceof Promise) throw new Error("unexpected async result");
      expect(result.type).toBe("answer");
    }
  });
});
