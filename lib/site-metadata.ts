import type { Metadata } from "next";

/**
 * Shared SEO metadata for the legacy site pages and the terminal flavour.
 * Values are copied verbatim from the original app/(site) pages so <title>,
 * description and canonical stay identical across both flavours.
 */

export const homeMetadata: Metadata = {
  title: "Free Online Utility Tools for Developers & Creators",
  description:
    "Astraa is a free utility toolkit with 15+ tools: scientific calculator, currency converter, password generator, hash generator, unit converter, markdown viewer, image resizer, and browser games. All processing happens locally in your browser.",
  openGraph: {
    title: "Astraa - Free Online Utility Tools",
    description:
      "15+ free browser-based utility tools for developers and creators.",
    url: "/",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Astraa - Free Online Utility Tools",
    description: "15+ free browser-based tools. No signup required.",
  },
  alternates: {
    canonical: "/",
  },
};

export const base64Metadata: Metadata = {
  title: "Base64 Encoder & Decoder",
  description:
    "Encode text or files to Base64 and decode Base64 back. URL-safe variant support, drag-and-drop, image preview — all in your browser.",
  keywords: [
    "base64 encoder",
    "base64 decoder",
    "base64 converter",
    "encode base64",
    "decode base64",
    "url-safe base64",
    "online base64 tool",
    "file to base64",
  ],
  openGraph: {
    title: "Base64 Encoder & Decoder",
    description:
      "Encode and decode Base64 text or files instantly in your browser with URL-safe support.",
    url: "/tools/base64",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Base64 Encoder & Decoder",
    description:
      "Encode and decode Base64 text or files instantly in your browser with URL-safe support.",
  },
  alternates: {
    canonical: "/tools/base64",
  },
};

export const calculatorMetadata: Metadata = {
  title: "Scientific Calculator",
  description:
    "Perform complex math calculations with our free Google-style scientific calculator. Supports trigonometry, logarithms, and advanced operations in your browser.",
  keywords: [
    "scientific calculator",
    "online calculator",
    "math calculator",
    "trigonometry calculator",
    "logarithm calculator",
    "advanced calculator",
    "free calculator",
    "browser calculator",
  ],
  openGraph: {
    title: "Scientific Calculator",
    description:
      "Free online scientific calculator with trigonometry, logarithms, and advanced math operations.",
    url: "/tools/calculator",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Scientific Calculator",
    description:
      "Free online scientific calculator with trigonometry, logarithms, and advanced math operations.",
  },
  alternates: {
    canonical: "/tools/calculator",
  },
};

export const currencyMetadata: Metadata = {
  title: "Currency Converter",
  description:
    "Convert between world currencies and cryptocurrencies using real-time exchange rates. Fast, free, and accurate currency conversion tool with 150+ currencies.",
  keywords: [
    "currency converter",
    "exchange rate",
    "forex converter",
    "cryptocurrency converter",
    "real-time exchange rates",
    "money converter",
    "USD to EUR",
    "currency calculator",
  ],
  openGraph: {
    title: "Currency Converter",
    description:
      "Convert currencies and crypto with real-time exchange rates. Free and accurate.",
    url: "/tools/currency",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Currency Converter",
    description:
      "Convert currencies and crypto with real-time exchange rates. Free and accurate.",
  },
  alternates: {
    canonical: "/tools/currency",
  },
};

export const hashMetadata: Metadata = {
  title: "Hash Generator",
  description:
    "Generate secure hash outputs including MD5, SHA-1, SHA-256, and SHA-512. Free online hashing tool for developers with instant client-side processing.",
  keywords: [
    "hash generator",
    "MD5 hash",
    "SHA-256 hash",
    "SHA-512 hash",
    "SHA-1 hash",
    "online hash tool",
    "checksum generator",
    "hash calculator",
  ],
  openGraph: {
    title: "Hash Generator",
    description:
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes instantly in your browser.",
    url: "/tools/hash",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Hash Generator",
    description:
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes instantly in your browser.",
  },
  alternates: {
    canonical: "/tools/hash",
  },
};

export const imageMetadata: Metadata = {
  title: "Image Resizer",
  description:
    "Upload and resize your images with multiple format options. Support for JPEG, PNG, and WebP formats with quality control. Free browser-based image tool.",
  keywords: [
    "image resizer",
    "image converter",
    "webp converter",
    "jpeg optimizer",
    "png optimizer",
    "image compression",
    "image tools",
    "resize image online",
  ],
  openGraph: {
    title: "Image Resizer",
    description:
      "Resize and convert images to JPEG, PNG, or WebP with quality control. Free and private.",
    url: "/tools/image",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Image Resizer",
    description:
      "Resize and convert images to JPEG, PNG, or WebP with quality control. Free and private.",
  },
  alternates: {
    canonical: "/tools/image",
  },
};

export const jsonMetadata: Metadata = {
  title: "JSON Editor",
  description:
    "Edit, format, validate, repair and convert JSON in your browser. Tree view, YAML/CSV/Markdown converters, TypeScript and Zod generators. Handles up to 50 MB. 100% local.",
  keywords: [
    "json editor",
    "json formatter",
    "json validator",
    "json to yaml",
    "json to csv",
    "json to typescript",
    "json to zod",
    "json schema",
    "developer tools",
  ],
  openGraph: {
    title: "JSON Editor",
    description: "Edit, format, convert and generate types from JSON. 100% local, up to 50 MB.",
    url: "/tools/json",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "JSON Editor",
    description: "Edit, format, convert and generate types from JSON. 100% local, up to 50 MB.",
  },
  alternates: {
    canonical: "/tools/json",
  },
};

export const markdownMetadata: Metadata = {
  title: "Markdown Editor | astraa",
  description:
    "Write Markdown with live preview. Local-only file storage, math and diagram rendering, drag-drop images, and PDF export. Free browser-based tool.",
  keywords: [
    "markdown editor",
    "markdown preview",
    "markdown to pdf",
    "markdown to html",
    "live preview",
    "developer tools",
  ],
  openGraph: {
    title: "Markdown Editor | astraa",
    description:
      "Write Markdown with live preview, math, diagrams, and PDF export. All local in your browser.",
    url: "/tools/markdown",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Markdown Editor | astraa",
    description: "Write Markdown with live preview. Free, local, browser-based.",
  },
  alternates: {
    canonical: "/tools/markdown",
  },
};

export const musicMetadata: Metadata = {
  title: "Lofi Focus Studio",
  description:
    "Stay productive with lofi beats, a built-in pomodoro timer, and task management. Free browser-based focus tool to boost concentration and workflow.",
  keywords: [
    "lofi music",
    "focus music",
    "pomodoro timer",
    "productivity tool",
    "study music",
    "lofi beats",
    "task manager",
    "focus studio",
  ],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Lofi Focus Studio",
    description:
      "Lofi beats, pomodoro timer, and task management in one free productivity tool.",
    url: "/tools/music",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Lofi Focus Studio",
    description:
      "Lofi beats, pomodoro timer, and task management in one free productivity tool.",
  },
  alternates: {
    canonical: "/tools/music",
  },
};

export const passwordMetadata: Metadata = {
  title: "Password Generator",
  description:
    "Create strong, secure passwords with customizable length and character options. Generate random passwords with uppercase, lowercase, numbers, and symbols instantly.",
  keywords: [
    "password generator",
    "strong password",
    "random password",
    "secure password",
    "password creator",
    "online password generator",
    "custom password",
    "password tool",
  ],
  openGraph: {
    title: "Password Generator",
    description:
      "Generate strong, secure passwords with customizable options. Free and private.",
    url: "/tools/password",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Password Generator",
    description:
      "Generate strong, secure passwords with customizable options. Free and private.",
  },
  alternates: {
    canonical: "/tools/password",
  },
};

export const regexMetadata: Metadata = {
  title: "Regex Tester | astraa",
  description:
    "Test and validate JavaScript regular expressions live in your browser. Capture-group highlights, replace mode, starter library, click-to-insert cheatsheet, and shareable URLs.",
  keywords: [
    "regex tester",
    "regular expression",
    "regex validator",
    "javascript regex",
    "regex playground",
    "regex cheatsheet",
    "online regex tool",
    "regex builder",
  ],
  openGraph: {
    title: "Regex Tester | astraa",
    description:
      "Live JavaScript regex playground with capture-group highlights, replace mode, and shareable URLs.",
    url: "/tools/regex",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Regex Tester | astraa",
    description:
      "Live JavaScript regex playground with capture-group highlights, replace mode, and shareable URLs.",
  },
  alternates: {
    canonical: "/tools/regex",
  },
};

export const snippetGeneratorMetadata: Metadata = {
  title: "Code Snippet Generator",
  description:
    "Create beautiful, social-ready images from code snippets or screenshots. " +
    "Choose gradients, themes, fonts, and aspect ratios. " +
    "All processing happens locally in your browser.",
  keywords: [
    "code snippet generator",
    "code to image",
    "screenshot beautifier",
    "social share code",
    "carbon alternative",
    "ray.so alternative",
  ],
  openGraph: {
    title: "Code Snippet Generator",
    description: "Generate shareable code and screenshot images with gradient backgrounds.",
    url: "/tools/snippet-generator",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Code Snippet Generator",
    description: "Generate shareable code and screenshot images with gradient backgrounds.",
  },
  alternates: {
    canonical: "/tools/snippet-generator",
  },
};

export const sqlMetadata: Metadata = {
  title: "SQL Formatter",
  description:
    "Format and beautify SQL queries instantly in your browser. Supports SELECT, JOIN, WHERE, and more. Free online SQL formatting tool for developers.",
  keywords: [
    "SQL formatter",
    "SQL beautifier",
    "format SQL",
    "SQL pretty print",
    "SQL query formatter",
    "online SQL formatter",
    "SQL tool",
    "developer tools",
  ],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "SQL Formatter",
    description:
      "Format and beautify SQL queries instantly. Free browser-based developer tool.",
    url: "/tools/sql",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "SQL Formatter",
    description:
      "Format and beautify SQL queries instantly. Free browser-based developer tool.",
  },
  alternates: {
    canonical: "/tools/sql",
  },
};

export const textMetadata: Metadata = {
  title: "AI Text Generator",
  description:
    "Generate meaningful, context-aware placeholder text tailored to your topic. The modern alternative to Lorem Ipsum powered by AI. Free online text generator.",
  keywords: [
    "AI text generator",
    "placeholder text",
    "Lorem Ipsum alternative",
    "content generator",
    "text generator",
    "AI writing tool",
    "dummy text generator",
    "sample text",
  ],
  openGraph: {
    title: "AI Text Generator",
    description:
      "Generate context-aware placeholder text with AI. The modern Lorem Ipsum alternative.",
    url: "/tools/text",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "AI Text Generator",
    description:
      "Generate context-aware placeholder text with AI. The modern Lorem Ipsum alternative.",
  },
  alternates: {
    canonical: "/tools/text",
  },
};

export const unitsMetadata: Metadata = {
  title: "Unit Converter",
  description:
    "Convert between different units of measurement including length, weight, temperature, and more. Free online unit conversion tool with metric and imperial support.",
  keywords: [
    "unit converter",
    "measurement converter",
    "length converter",
    "weight converter",
    "temperature converter",
    "metric converter",
    "imperial converter",
    "conversion tool",
    "unit conversion calculator",
    "measurement tool",
  ],
  openGraph: {
    title: "Unit Converter",
    description:
      "Convert length, weight, temperature, and more. Free online unit conversion tool.",
    url: "/tools/units",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Unit Converter",
    description:
      "Convert length, weight, temperature, and more. Free online unit conversion tool.",
  },
  alternates: {
    canonical: "/tools/units",
  },
};

/** Tool metadata keyed by the public /tools/<slug> folder name (14 slugs). */
export const toolMetadataBySlug: Record<string, Metadata> = {
  "base64": base64Metadata,
  "calculator": calculatorMetadata,
  "currency": currencyMetadata,
  "hash": hashMetadata,
  "image": imageMetadata,
  "json": jsonMetadata,
  "markdown": markdownMetadata,
  "music": musicMetadata,
  "password": passwordMetadata,
  "regex": regexMetadata,
  "snippet-generator": snippetGeneratorMetadata,
  "sql": sqlMetadata,
  "text": textMetadata,
  "units": unitsMetadata,
};
