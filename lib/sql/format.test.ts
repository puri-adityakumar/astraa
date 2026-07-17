import { describe, it, expect } from "vitest";
import { formatSql } from "./format";

describe("formatSql", () => {
  it("formats a simple SELECT query", () => {
    expect(formatSql("SELECT id, name FROM users")).toBe("SELECT\n  id, name \nFROM\n  users");
  });

  it("formats a SELECT with a WHERE clause", () => {
    expect(formatSql("SELECT * FROM users WHERE id = 1")).toBe(
      "SELECT\n  * \nFROM\n  users \nWHERE\n  id = 1",
    );
  });

  it("formats a SELECT with a JOIN", () => {
    expect(formatSql("SELECT * FROM users JOIN orders ON users.id = orders.user_id")).toBe(
      "SELECT\n  * \nFROM\n  users \nJOIN\n  orders ON users.id = orders.user_id",
    );
  });

  it("returns an empty string for empty input", () => {
    expect(formatSql("")).toBe("");
  });

  it("trims whitespace-only input to an empty string", () => {
    expect(formatSql("   ")).toBe("");
  });

  it("normalizes spacing, commas, and case-insensitive keywords", () => {
    expect(formatSql("select name , age from users where age >  18 order by  name")).toBe(
      "SELECT\n  name, age \nFROM\n  users \nWHERE\n  age > 18 \nORDER BY\n  name",
    );
  });

  it("normalizes parentheses and collapses repeated whitespace", () => {
    // "( name )" -> after \s+ collapse -> "( name )" -> "( " -> "(", " )" -> ")"
    expect(formatSql("SELECT  ( name )   FROM   t")).toBe("SELECT\n  (name) \nFROM\n  t");
  });
});
