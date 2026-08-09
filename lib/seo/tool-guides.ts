import type { ToolId } from "@/lib/tools";

export const GUIDED_TOOL_IDS = [
  "password",
  "hash",
  "text",
  "currency",
  "image",
  "units",
  "calculator",
  "json",
  "sql",
  "regex",
  "markdown",
  "base64",
  "snippet-generator",
] as const satisfies readonly ToolId[];

export type GuidedToolId = (typeof GUIDED_TOOL_IDS)[number];

export type ToolGuideContent = {
  heading: string;
  summary: string;
  steps: readonly string[];
  capabilities: readonly string[];
  example: {
    inputLabel: string;
    input: string;
    outputLabel: string;
    output: string;
  };
  processing: string;
  limitations: readonly string[];
};

export const TOOL_GUIDES: Record<GuidedToolId, ToolGuideContent> = {
  password: {
    heading: "How to generate a password or passphrase",
    summary:
      "Choose a random string, a multiword passphrase, or a numeric PIN, then tune only the controls that apply to that mode.",
    steps: [
      "Select Random, Memorable, or PIN.",
      "Set the character or word count and enable the available options.",
      "Copy the result, or refresh it to create a different value.",
    ],
    capabilities: [
      "Random passwords from 6 to 64 characters",
      "Memorable passphrases from 3 to 10 words",
      "Numeric PINs from 3 to 12 digits",
    ],
    example: {
      inputLabel: "Settings",
      input: "Random · 20 characters · numbers on · symbols on",
      outputLabel: "Result",
      output: "A newly generated 20-character value; the exact value changes every time.",
    },
    processing:
      "Generation uses browser cryptographic randomness and does not send the generated value to Astraa.",
    limitations: [
      "A generated value is not stored or recovered by Astraa after you leave the page.",
      "Use a password manager and follow the rules of the service where the value will be used.",
    ],
  },
  json: {
    heading: "How to inspect and transform JSON",
    summary:
      "Paste JSON or open a .json file, then switch between source, tree, conversion, and type-generation views while the document stays in this browser.",
    steps: [
      "Paste a document or open a local .json file.",
      "Format, validate, repair, sort, or inspect values in the tree view.",
      "Convert the parsed data or generate TypeScript, Zod, or JSON Schema output.",
    ],
    capabilities: [
      "Local .json file input up to 50 MB",
      "YAML, CSV, and Markdown conversion",
      "TypeScript, Zod, and JSON Schema generation",
    ],
    example: {
      inputLabel: "Compact JSON",
      input: '{"name":"Astraa","active":true}',
      outputLabel: "Formatted JSON",
      output: '{\n  "name": "Astraa",\n  "active": true\n}',
    },
    processing:
      "Parsing, repair, conversion, and generation run in the browser. Editor state is stored only in local browser storage when it fits the persistence cap.",
    limitations: [
      "Repair is best-effort: it can correct common syntax mistakes but cannot recover every malformed document.",
      "Documents larger than 256 KB remain usable but are not persisted between visits.",
    ],
  },
  sql: {
    heading: "How to format SQL for a selected dialect",
    summary:
      "Choose one of six tested SQL dialects, set keyword case and indentation, then format a bounded source without replacing it.",
    steps: [
      "Choose Basic SQL, PostgreSQL, MySQL/MariaDB, SQLite, SQL Server, or BigQuery.",
      "Set preserve, upper, or lower keyword case and choose two- or four-space indentation.",
      "Enter up to 100 KB of SQL, choose Format SQL, then copy the read-only result if it succeeds.",
    ],
    capabilities: [
      "Six explicitly tested SQL dialect mappings",
      "Preserved, uppercase, or lowercase keywords",
      "Two- or four-space indentation with source preservation",
    ],
    example: {
      inputLabel: "Basic SQL",
      input: "select id,name from users where active=1;",
      outputLabel: "Uppercase, two spaces",
      output: "SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  active = 1;",
    },
    processing:
      "Formatting runs in this browser only after you choose Format SQL. Astraa does not upload or persist the source or formatted result.",
    limitations: [
      "Input is capped at 100 KB measured as UTF-8 bytes.",
      "Formatting changes layout and configured keyword case; it does not validate semantics, safety, executability, or optimization.",
      "Stored procedures and custom delimiters other than ; are not supported by the formatter.",
    ],
  },
  regex: {
    heading: "How to test a JavaScript regular expression",
    summary:
      "Enter a pattern and flags, add a test string, and inspect matches, capture groups, replacement output, and generated code in one workspace.",
    steps: [
      "Enter the pattern without surrounding slash characters and choose flags.",
      "Paste or load a test string and review highlighted matches.",
      "Open Replace, Tests, Explain, or Code when you need a deeper check.",
    ],
    capabilities: [
      "JavaScript regular-expression syntax and flags",
      "Capture-group highlighting and replacement preview",
      "Shareable URL state and match export",
    ],
    example: {
      inputLabel: "Pattern and text",
      input: "\\b[A-Z][a-z]+\\b  →  Astraa ships tools.",
      outputLabel: "Match",
      output: "Astraa",
    },
    processing:
      "Pattern execution runs in a browser worker with a time limit, so test content is not sent to a regex service.",
    limitations: [
      "The test string is capped at 100 KB.",
      "Shared URLs trim test content to 8 KB, and expensive patterns may be stopped before completing.",
    ],
  },
  markdown: {
    heading: "How to edit and export Markdown",
    summary:
      "Open a Markdown or text file, toggle into edit mode, preview extended syntax, and export the current document from the same browser workspace.",
    steps: [
      "Drop or choose a .md, .markdown, or .txt file up to 5 MB.",
      "Switch to edit mode, make changes, and save them to local browser storage.",
      "Export the document as Markdown, HTML, or through the browser PDF print flow.",
    ],
    capabilities: [
      "Live preview with GitHub-flavored Markdown",
      "Math, Mermaid diagrams, and dropped images",
      "A local library of up to 10 documents",
    ],
    example: {
      inputLabel: "Markdown",
      input: "# Release notes\n\n- Fixed parser\n- Added export",
      outputLabel: "Preview",
      output: "A Release notes heading followed by a two-item list.",
    },
    processing:
      "Document parsing, preview, editing, and export happen locally. Saved documents remain in this browser and are not cloud-synced.",
    limitations: [
      "Dropped images are embedded into the document and can increase local storage use.",
      "PDF output depends on the browser print dialog and its available options.",
    ],
  },
  base64: {
    heading: "How to encode or decode Base64",
    summary:
      "Switch between encode and decode, choose text or a local file, and copy or download the converted result with optional URL-safe handling.",
    steps: [
      "Choose Encode or Decode and select text or file input.",
      "Add the source value and enable URL-safe or line-wrapping options when needed.",
      "Copy the result, download decoded bytes, or swap the output back into the input.",
    ],
    capabilities: [
      "Text and files up to 25 MB",
      "Standard and URL-safe Base64 variants",
      "Decoded image preview and byte-level hex preview",
    ],
    example: {
      inputLabel: "UTF-8 text",
      input: "Hello, Astraa!",
      outputLabel: "Base64",
      output: "SGVsbG8sIEFzdHJhYSE=",
    },
    processing:
      "Encoding and decoding are performed in the browser. The selected file and pasted value stay in the browser.",
    limitations: [
      "Base64 is an encoding, not encryption, and does not hide sensitive data.",
      "Large conversions temporarily use additional browser memory for both input and output.",
    ],
  },
  hash: {
    heading: "How to generate and compare a text hash",
    summary:
      "Select an algorithm, enter the exact text to hash, and copy the deterministic hexadecimal digest for checksum comparison.",
    steps: [
      "Choose MD5, SHA-1, SHA-256, SHA-512, SHA3-256, or SHA3-512.",
      "Enter the text exactly as it should be hashed, including whitespace.",
      "Generate the digest and copy it for comparison with another source.",
    ],
    capabilities: [
      "Six MD5, SHA-1, SHA-2, and SHA-3 variants",
      "Deterministic hexadecimal output",
      "Text processing in the browser",
    ],
    example: {
      inputLabel: "SHA-256 input",
      input: "hello",
      outputLabel: "Digest",
      output: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    },
    processing:
      "The selected digest is calculated locally from the text in the browser and is not sent to Astraa.",
    limitations: [
      "MD5 and SHA-1 are legacy algorithms and should not be used for security-critical verification.",
      "This is a raw hash tool; it does not salt or stretch passwords for storage.",
    ],
  },
  currency: {
    heading: "How to convert fiat or cryptocurrency values",
    summary:
      "Choose the fiat or crypto converter, select a pair, and enter an amount after the current cached rate has loaded.",
    steps: [
      "Choose Fiat Currency or Cryptocurrency.",
      "Select the source and target assets to request their rate.",
      "Enter an amount; Astraa multiplies it by the loaded rate in your browser.",
    ],
    capabilities: [
      "Supported fiat currency pairs",
      "Supported cryptocurrency-to-fiat pairs",
      "Rate caching that avoids a new request for every amount change",
    ],
    example: {
      inputLabel: "Conversion",
      input: "10 USD → EUR",
      outputLabel: "Calculation",
      output: "10 × the provider-backed USD/EUR rate shown by the tool.",
    },
    processing:
      "The selected pair is sent to Astraa's rate endpoint and then to the configured data provider. The typed amount stays in the browser.",
    limitations: [
      "Rates are cached and may differ from a bank, exchange, or completed transaction.",
      "Results depend on provider availability and are informational rather than financial advice.",
    ],
  },
  text: {
    heading: "How to generate topic-based placeholder prose",
    summary:
      "Enter a topic and requested word count, then ask the configured AI provider for placeholder prose through Astraa's server action.",
    steps: [
      "Enter a non-empty topic of no more than 500 characters.",
      "Choose a whole-number word count from 10 through 1,000.",
      "Generate the prose, then copy the returned text if the provider succeeds.",
    ],
    capabilities: [
      "Topic-based prose requests",
      "Requested lengths from 10 to 1,000 words",
      "Typed unavailable, timeout, and rate-limit errors",
    ],
    example: {
      inputLabel: "Request",
      input: "Topic: seed-starting basics · 120 words",
      outputLabel: "Result",
      output: "Provider-generated prose about seed-starting; wording and length vary.",
    },
    processing:
      "The topic and requested word count go through Astraa's server to the configured OpenRouter provider. The provider returns generated text to the browser.",
    limitations: [
      "Generation requires the server and rate limiter to be configured and the provider to be available.",
      "The requested word count is approximate, and repeated requests can return different wording.",
    ],
  },
  image: {
    heading: "How to resize and convert an image",
    summary:
      "Load a browser-readable image, set pixel dimensions and aspect-ratio behavior, choose JPEG, PNG, or WebP output, then adjust quality for JPEG or WebP and download the result.",
    steps: [
      "Choose or drop a JPEG, PNG, or WebP image.",
      "Set width and height, keeping the aspect-ratio lock on when proportions should match.",
      "Choose JPEG, PNG, or WebP; adjust quality for JPEG or WebP, then download the resized file.",
    ],
    capabilities: [
      "Pixel-based resizing with optional aspect-ratio lock",
      "JPEG, PNG, and WebP export",
      "Estimated output size before download",
    ],
    example: {
      inputLabel: "Original",
      input: "1600 × 900 PNG",
      outputLabel: "With width 800 and ratio locked",
      output: "800 × 450 in the selected export format.",
    },
    processing:
      "The image stays in the browser while it is decoded, drawn to a canvas, resized, and exported.",
    limitations: [
      "Very large images can exceed the memory available to the browser.",
      "PNG export ignores the JPEG/WebP quality setting, while JPEG output does not preserve transparency.",
    ],
  },
  units: {
    heading: "How to convert measurement units",
    summary:
      "Choose one of 16 measurement categories, select source and destination units, and enter a numeric value for an in-browser conversion.",
    steps: [
      "Choose a category such as Length, Temperature, Bits & Bytes, or Volume.",
      "Select the source and destination units from that category.",
      "Enter a value and read the converted result, rounded to at most six decimal places.",
    ],
    capabilities: [
      "16 categories covering common physical and data measurements",
      "Metric and imperial ratio conversions",
      "Celsius, Fahrenheit, and Kelvin conversions",
    ],
    example: {
      inputLabel: "Temperature",
      input: "100 °C",
      outputLabel: "Converted value",
      output: "212 °F",
    },
    processing:
      "The selected units and numeric value are converted in the browser from the fixed ratios bundled with Astraa.",
    limitations: [
      "Month and year entries use average durations rather than calendar-aware dates.",
      "The fixed ratios are not a substitute for domain-specific precision or live market rates.",
    ],
  },
  calculator: {
    heading: "How to use the scientific calculator",
    summary:
      "Enter arithmetic with the keypad or keyboard, choose radians or degrees for trigonometry, and commit the expression to display its result.",
    steps: [
      "Enter numbers and arithmetic operators with the keypad or keyboard.",
      "Choose RAD or DEG before applying sine, cosine, or tangent.",
      "Use equals to commit an expression, or apply a logarithm, square root, or factorial.",
    ],
    capabilities: [
      "Addition, subtraction, multiplication, division, and powers",
      "Sine, cosine, and tangent in radians or degrees",
      "Base-10 and natural logarithms, square roots, and factorials",
    ],
    example: {
      inputLabel: "Expression",
      input: "2 + 3 * 4",
      outputLabel: "Result",
      output: "14",
    },
    processing:
      "Expressions and scientific functions are evaluated in the browser; calculator input is not sent to Astraa.",
    limitations: [
      "Results use JavaScript number precision and can include floating-point rounding.",
      "Division by zero and values outside a function's numeric domain can produce Infinity or NaN.",
    ],
  },
  "snippet-generator": {
    heading: "How to turn code or a screenshot into an image",
    summary:
      "Choose code or screenshot mode, style the canvas and window frame, then export a PNG sized for documentation or social sharing.",
    steps: [
      "Enter code or choose a PNG, JPEG, or WebP screenshot.",
      "Adjust syntax theme, font, frame, background, padding, and aspect ratio.",
      "Download a 1× or 2× PNG, or copy it when the browser supports image clipboard access.",
    ],
    capabilities: [
      "Code input up to 100 KB",
      "Screenshot input up to 5 MB",
      "Configurable output dimensions from 100 to 4000 pixels",
    ],
    example: {
      inputLabel: "Code",
      input: "const ready = true;",
      outputLabel: "Export",
      output: "A styled PNG containing the highlighted line inside the selected frame.",
    },
    processing:
      "Syntax highlighting, image composition, and PNG export run in the browser. Source code and selected screenshots stay in the browser.",
    limitations: [
      "Clipboard image export depends on browser permission and API support.",
      "Very large output dimensions can take longer to render or exceed browser memory.",
    ],
  },
};
