/**
 * Basic SQL formatting.
 *
 * Applies a fixed chain of regex substitutions to normalize and beautify a
 * SQL query string. This is intentionally a naive formatter for demonstration
 * purposes (a production formatter would use a proper SQL parser).
 *
 * The substitution order is preserved verbatim from the original inline
 * implementation in the SQL formatter component.
 *
 * @param input - The raw SQL query string to format.
 * @returns The formatted SQL query string.
 */
export function formatSql(input: string): string {
  return input
    .replace(/\s+/g, " ")
    .replace(/ ,/g, ",")
    .replace(/\( /g, "(")
    .replace(/ \)/g, ")")
    .replace(/ +/g, " ")
    .trim()
    .replace(/SELECT /gi, "SELECT\n  ")
    .replace(/FROM /gi, "\nFROM\n  ")
    .replace(/WHERE /gi, "\nWHERE\n  ")
    .replace(/ORDER BY /gi, "\nORDER BY\n  ")
    .replace(/GROUP BY /gi, "\nGROUP BY\n  ")
    .replace(/HAVING /gi, "\nHAVING\n  ")
    .replace(/LIMIT /gi, "\nLIMIT\n  ")
    .replace(/AND /gi, "\n  AND ")
    .replace(/OR /gi, "\n  OR ")
    .replace(/JOIN /gi, "\nJOIN\n  ")
    .replace(/LEFT JOIN /gi, "\nLEFT JOIN\n  ")
    .replace(/RIGHT JOIN /gi, "\nRIGHT JOIN\n  ")
    .replace(/INNER JOIN /gi, "\nINNER JOIN\n  ");
}
