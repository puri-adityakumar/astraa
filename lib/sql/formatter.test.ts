import { describe, expect, it, vi } from "vitest";

import { createSqlFormatter } from "@/lib/sql/formatter";
import {
  DEFAULT_SQL_OPTIONS,
  MAX_SQL_BYTES,
  SQL_DIALECTS,
  SQL_LOAD_ERROR_MESSAGE,
  SQL_OVERSIZED_MESSAGE,
  SQL_PARSE_MESSAGE,
  SQL_UNEXPECTED_ERROR_MESSAGE,
  SQL_UPSTREAM_LIMITATION,
} from "@/lib/sql/types";
import type { SqlFormatterLoader, SqlFormatterModule } from "@/lib/sql/formatter";
import type { SqlFormatOptions } from "@/lib/sql/types";

const formatWithRealUpstream = createSqlFormatter(() => import("sql-formatter"));
const EXPECTED_SQL_DIALECTS = [
  {
    expectedFragments: ["active = 1"],
    id: "basic",
    input: "select id from users where active=1;",
    label: "Basic SQL",
    upstreamId: "sql",
  },
  {
    expectedFragments: ["payload ->> 'name'", "$1"],
    id: "postgresql",
    input: "select payload->>'name' as name from events where id=$1;",
    label: "PostgreSQL",
    upstreamId: "postgresql",
  },
  {
    expectedFragments: ["`order`", "?"],
    id: "mysql",
    input: "select `order`,? from `orders` limit 5;",
    label: "MySQL/MariaDB",
    upstreamId: "mysql",
  },
  {
    expectedFragments: ["json_extract(payload, '$.name')"],
    id: "sqlite",
    input: "select json_extract(payload,'$.name') from events limit 1;",
    label: "SQLite",
    upstreamId: "sqlite",
  },
  {
    expectedFragments: ["TOP (5) [order]", "@id"],
    id: "sql-server",
    input: "select top (5) [order] from [orders] where id=@id;",
    label: "SQL Server",
    upstreamId: "transactsql",
  },
  {
    expectedFragments: ["`project.dataset.users`", "@id"],
    id: "bigquery",
    input: "select user.name from `project.dataset.users` where id=@id;",
    label: "BigQuery",
    upstreamId: "bigquery",
  },
] as const;

describe("createSqlFormatter", () => {
  it("formats SELECT, FROM, WHERE, and a nested query", async () => {
    const input =
      "select u.id,(select count(*) from orders o where o.user_id=u.id) as total " +
      "from users u where u.active=1;";
    const result = await formatWithRealUpstream(input, DEFAULT_SQL_OPTIONS);

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.output).toContain("SELECT\n");
    expect(result.output).toMatch(/FROM\n\s+orders o/);
    expect(result.output).toMatch(/WHERE\n\s+o\.user_id = u\.id/);
    expect(result.output).toContain("FROM\n  users u");
    expect(result.output).toContain("WHERE\n  u.active = 1");
    expect(result.input).toBe(input);
  });

  it.each([
    {
      dialect: "postgresql" as const,
      input: `select 'SELECT FROM WHERE', "FROM" from "users";`,
      preserved: [`'SELECT FROM WHERE'`, '"FROM"'],
    },
    {
      dialect: "mysql" as const,
      input: "select `SELECT`, 'FROM WHERE' from `users`;",
      preserved: ["`SELECT`", "'FROM WHERE'"],
    },
    {
      dialect: "sql-server" as const,
      input: "select [SELECT], 'FROM WHERE' from [users];",
      preserved: ["[SELECT]", "'FROM WHERE'"],
    },
  ])("preserves keywords inside quoted values and $dialect identifiers", async (fixture) => {
    const result = await formatWithRealUpstream(fixture.input, {
      ...DEFAULT_SQL_OPTIONS,
      dialect: fixture.dialect,
    });

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    for (const expected of fixture.preserved) expect(result.output).toContain(expected);
  });

  it("preserves line and block comments containing SQL keywords", async () => {
    const input =
      "select id -- SELECT FROM WHERE LEFT JOIN\nfrom users /* SELECT FROM WHERE */ where id=1;";
    const result = await formatWithRealUpstream(input, {
      ...DEFAULT_SQL_OPTIONS,
      dialect: "sqlite",
    });

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.output).toContain("-- SELECT FROM WHERE LEFT JOIN");
    expect(result.output).toContain("/* SELECT FROM WHERE */");
  });

  it("keeps LEFT JOIN intact across multiple semicolon-terminated statements", async () => {
    const input = "select a.id,b.name from a left join b on b.id=a.id; select count(*) from b;";
    const result = await formatWithRealUpstream(input, DEFAULT_SQL_OPTIONS);

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.output).toContain("LEFT JOIN");
    expect(result.output).not.toContain("LEFT\nJOIN");
    expect(result.output.match(/;/g)).toHaveLength(2);
    expect(result.output).toContain(";\n\nSELECT");
  });

  it.each([
    ["mysql", "select * from users where id = ?", "?"],
    ["postgresql", "select * from users where id = $1", "$1"],
    ["postgresql", "select * from users where role = :role", ":role"],
  ] as const)("preserves supported %s placeholders", async (dialect, input, placeholder) => {
    const result = await formatWithRealUpstream(input, { ...DEFAULT_SQL_OPTIONS, dialect });

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.output).toContain(placeholder);
  });

  it("publishes the exact six-row dialect mapping", () => {
    expect(SQL_DIALECTS).toEqual(
      EXPECTED_SQL_DIALECTS.map(({ id, label, upstreamId }) => ({ id, label, upstreamId })),
    );
  });

  it.each(EXPECTED_SQL_DIALECTS)(
    "maps $label to the exact upstream $upstreamId dialect",
    async ({ id, upstreamId }) => {
      const format = vi.fn(() => "formatted");
      const formatter = createSqlFormatter(async () => ({ format }) as SqlFormatterModule);
      const result = await formatter("select 1", { ...DEFAULT_SQL_OPTIONS, dialect: id });

      expect(result.status).toBe("success");
      expect(format).toHaveBeenCalledWith(
        "select 1",
        expect.objectContaining({ language: upstreamId }),
      );
    },
  );

  it.each(EXPECTED_SQL_DIALECTS)(
    "formats representative $label syntax through the real upstream dialect",
    async ({ expectedFragments, id, input }) => {
      const result = await formatWithRealUpstream(input, {
        ...DEFAULT_SQL_OPTIONS,
        dialect: id,
      });

      expect(result.status).toBe("success");
      if (result.status !== "success") return;
      for (const fragment of expectedFragments) expect(result.output).toContain(fragment);
      expect(result.input).toBe(input);
    },
  );

  it.each(["preserve", "upper", "lower"] as const)(
    "passes the %s keyword-case option",
    async (keywordCase) => {
      const format = vi.fn(() => "formatted");
      const formatter = createSqlFormatter(async () => ({ format }) as SqlFormatterModule);

      await formatter("select 1", { ...DEFAULT_SQL_OPTIONS, keywordCase });

      expect(format).toHaveBeenCalledWith("select 1", expect.objectContaining({ keywordCase }));
    },
  );

  it.each([2, 4] as const)("passes a %s-space indentation option", async (indentSize) => {
    const format = vi.fn(() => "formatted");
    const formatter = createSqlFormatter(async () => ({ format }) as SqlFormatterModule);

    await formatter("select 1", { ...DEFAULT_SQL_OPTIONS, indentSize });

    expect(format).toHaveBeenCalledWith(
      "select 1",
      expect.objectContaining({ tabWidth: indentSize, useTabs: false }),
    );
  });

  it.each([
    ["basic", "create procedure refresh_totals() begin select 1; end;"],
    ["mysql", "CREATE DEFINER = 'app'@'localhost' PROCEDURE refresh_totals() SELECT 1;"],
    ["sql-server", "CREATE OR ALTER PROC refresh_totals AS SELECT 1;"],
    ["sql-server", "ALTER PROC refresh_totals AS SELECT 1;"],
    ["sql-server", "SELECT 1\nGO\nCREATE OR ALTER PROC refresh_totals AS SELECT 1;"],
    ["sql-server", "SELECT 1\ngo\nALTER PROC refresh_totals AS SELECT 1;"],
    ["postgresql", "SELECT 'closed \\' ; CREATE PROCEDURE hidden;"],
    ["sqlite", "SELECT 'closed \\' ; CREATE PROCEDURE hidden;"],
    ["sql-server", "SELECT 'closed \\' ; CREATE OR ALTER PROC hidden AS SELECT 1;"],
    ["mysql", "DELIMITER $$\nCREATE FUNCTION sample() RETURNS INT RETURN 1$$"],
    ["mysql", "DELIMITER //\nCREATE FUNCTION sample() RETURNS INT RETURN 1//"],
  ] as const)(
    "surfaces the exact $0 upstream limitation before importing",
    async (dialect, input) => {
      const loader = vi.fn<SqlFormatterLoader>();
      const formatter = createSqlFormatter(loader);

      const result = await formatter(input, { ...DEFAULT_SQL_OPTIONS, dialect });

      expect(result).toMatchObject({
        input,
        message: SQL_UPSTREAM_LIMITATION,
        reason: "upstream-limitation",
        status: "unsupported",
      });
      expect(loader).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["postgresql", "SELECT $$\nCREATE PROCEDURE hidden\n$$;"],
    ["postgresql", "SELECT $body$\nCREATE PROCEDURE hidden\n$body$;"],
    ["postgresql", "SELECT E'escaped \\' ; CREATE PROCEDURE hidden' AS value;"],
    ["mysql", "SELECT 1 # ; CREATE PROCEDURE hidden"],
    ["bigquery", "SELECT 1 # ; CREATE PROCEDURE hidden"],
    ["bigquery", "SELECT R'''one ' unmatched\n; CREATE PROCEDURE hidden\n''' AS value;"],
    ["bigquery", 'SELECT r"""one " unmatched\n; CREATE PROCEDURE hidden\n""" AS value;'],
    ["bigquery", "SELECT 'escaped \\' ; CREATE PROCEDURE hidden' AS value;"],
    ["bigquery", "SELECT R'one \" unmatched ; CREATE PROCEDURE hidden' AS value;"],
    ["postgresql", "/* outer /* inner */ CREATE PROCEDURE hidden */ SELECT 1;"],
    ["sql-server", "/* outer /* inner */ CREATE PROCEDURE hidden */ SELECT 1;"],
    ["sql-server", "SELECT 'GO\nCREATE PROCEDURE hidden' AS note;"],
    ["sql-server", "/* GO\nCREATE PROCEDURE hidden */ SELECT 1;"],
  ] as const)("does not preflight-reject valid $0 quoting or comments", async (dialect, input) => {
    const result = await formatWithRealUpstream(input, { ...DEFAULT_SQL_OPTIONS, dialect });

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.input).toBe(input);
    expect(result.output).toContain("CREATE PROCEDURE hidden");
  });

  it("does not classify DELIMITER ; as a custom-delimiter change", async () => {
    const input = "DELIMITER ;\nselect 1;";
    const result = await formatWithRealUpstream(input, {
      ...DEFAULT_SQL_OPTIONS,
      dialect: "mysql",
    });

    expect(result).not.toMatchObject({ reason: "upstream-limitation" });
    expect(result.input).toBe(input);
  });

  it("does not mistake limitations inside strings, identifiers, or comments for SQL", async () => {
    const input =
      "select 'CREATE PROCEDURE hidden', `DELIMITER $$` -- CREATE PROCEDURE ignored\nfrom t;";
    const format = vi.fn(() => "formatted");
    const loader = vi.fn(async () => ({ format }) as SqlFormatterModule);
    const formatter = createSqlFormatter(loader);

    const result = await formatter(input, { ...DEFAULT_SQL_OPTIONS, dialect: "mysql" });

    expect(result.status).toBe("success");
    expect(loader).toHaveBeenCalledOnce();
  });

  it.each(["", "  \n\t"])("returns empty without importing for %j", async (input) => {
    const loader = vi.fn<SqlFormatterLoader>();
    const formatter = createSqlFormatter(loader);

    const result = await formatter(input, DEFAULT_SQL_OPTIONS);

    expect(result).toEqual({
      byteLength: new TextEncoder().encode(input).byteLength,
      input,
      message: "Enter SQL to format.",
      status: "empty",
    });
    expect(loader).not.toHaveBeenCalled();
  });

  it.each([
    ["ASCII", "x".repeat(MAX_SQL_BYTES), MAX_SQL_BYTES, "success"],
    ["ASCII", "x".repeat(MAX_SQL_BYTES + 1), MAX_SQL_BYTES + 1, "oversized"],
    ["UTF-8", "é".repeat(MAX_SQL_BYTES / 2), MAX_SQL_BYTES, "success"],
    ["UTF-8", `${"é".repeat(MAX_SQL_BYTES / 2)}a`, MAX_SQL_BYTES + 1, "oversized"],
  ] as const)(
    "enforces the exact %s boundary at %s bytes",
    async (_encoding, input, expectedBytes, status) => {
      const format = vi.fn((query: string) => query);
      const loader = vi.fn(async () => ({ format }) as SqlFormatterModule);
      const formatter = createSqlFormatter(loader);

      const result = await formatter(input, DEFAULT_SQL_OPTIONS);

      expect(result.byteLength).toBe(expectedBytes);
      expect(result.input).toBe(input);
      expect(result.status).toBe(status);
      if (status === "oversized") {
        expect(result).toMatchObject({
          maxBytes: MAX_SQL_BYTES,
          message: SQL_OVERSIZED_MESSAGE,
        });
        expect(loader).not.toHaveBeenCalled();
      } else {
        expect(loader).toHaveBeenCalledOnce();
      }
    },
  );

  it("maps lazy-import rejection to a safe retryable result", async () => {
    const input = "select private_value from secrets";
    const formatter = createSqlFormatter(async () => {
      throw new Error(`chunk failed: ${input}`);
    });

    const result = await formatter(input, DEFAULT_SQL_OPTIONS);

    expect(result).toEqual({
      byteLength: input.length,
      input,
      message: SQL_LOAD_ERROR_MESSAGE,
      retryable: true,
      status: "load-error",
    });
    expect(JSON.stringify(result)).not.toContain("chunk failed");
  });

  it("maps an upstream parse throw without exposing parser details", async () => {
    const input = "select 'unterminated";
    const formatter = createSqlFormatter(async () => ({
      format: () => {
        throw new Error(`Parse error: token in ${input}`);
      },
    }));

    const result = await formatter(input, DEFAULT_SQL_OPTIONS);

    expect(result).toMatchObject({
      input,
      message: SQL_PARSE_MESSAGE,
      reason: "syntax",
      status: "unsupported",
    });
    expect(JSON.stringify(result)).not.toContain("token in");
  });

  it("maps an unexpected upstream throw to a sanitized retryable result", async () => {
    const input = "select private_value from secrets";
    const formatter = createSqlFormatter(async () => ({
      format: () => {
        throw new Error(`unexpected private input: ${input}`);
      },
    }));

    const result = await formatter(input, DEFAULT_SQL_OPTIONS);

    expect(result).toEqual({
      byteLength: input.length,
      input,
      message: SQL_UNEXPECTED_ERROR_MESSAGE,
      retryable: true,
      status: "unexpected-error",
    });
    expect(JSON.stringify(result)).not.toContain("private input");
  });

  it("keeps input unchanged when real upstream parsing fails", async () => {
    const input = "select 'unterminated";
    const result = await formatWithRealUpstream(input, DEFAULT_SQL_OPTIONS);

    expect(result).toMatchObject({ input, message: SQL_PARSE_MESSAGE, status: "unsupported" });
  });

  it.each([
    [
      { ...DEFAULT_SQL_OPTIONS, dialect: "oracle" } as unknown as SqlFormatOptions,
      "dialect",
      "CREATE PROCEDURE hidden() SELECT 1;",
    ],
    [
      { ...DEFAULT_SQL_OPTIONS, indentSize: 8 } as unknown as SqlFormatOptions,
      "options",
      "select 1",
    ],
  ] as const)(
    "rejects unsupported runtime options before importing",
    async (options, reason, input) => {
      const loader = vi.fn<SqlFormatterLoader>();
      const formatter = createSqlFormatter(loader);

      const result = await formatter(input, options);

      expect(result).toMatchObject({ reason, status: "unsupported" });
      expect(loader).not.toHaveBeenCalled();
    },
  );
});
