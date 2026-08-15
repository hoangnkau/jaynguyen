/**
 * A very small Markdown → Lexical converter, for seeding posts only.
 *
 * WHY NOT A MARKDOWN LIBRARY
 *
 * This runs once, from a script, over files written specifically for it. A
 * real parser would bring a dependency and its transitive tree into a project
 * whose running-cost argument is that it has very few of them (blueprint §5),
 * in order to handle syntax that is not used. The moment the site needs to
 * render arbitrary Markdown from an untrusted source, throw this away and take
 * the dependency — that is a different problem with different requirements.
 *
 * WHAT IT SUPPORTS
 *
 *   ## and ###            headings
 *   - item                bullet list
 *   1. item               numbered list
 *   > quote               blockquote
 *   ---                   horizontal rule
 *   blank-line-separated  paragraphs
 *   **bold**  *italic*  `code`  [text](url)
 *
 * Anything else is passed through as literal text, on purpose: silent
 * mis-parsing is far worse than a visible stray asterisk in a draft you are
 * about to read anyway.
 */

/* Lexical's text format is a bitmask; these are the two bits used here. */
const BOLD = 1;
const ITALIC = 2;
const CODE = 16;

/**
 * Payload generates a body type of `{ type: any; version: number; [k: string]:
 * unknown }[]` for rich-text children, so every node must carry `type` and
 * `version` for the seeded document to satisfy it. `Record<string, unknown>`
 * looks equivalent and is not — it guarantees neither, and the assignment
 * fails at the call site with an error pointing at the wrong file.
 */
type Node = { type: string; version: number; [k: string]: unknown };

const base = { format: "" as const, indent: 0, version: 1, direction: "ltr" as const };

const textNode = (text: string, format = 0): Node => ({
  type: "text",
  detail: 0,
  format,
  mode: "normal",
  style: "",
  text,
  version: 1,
});

const linkNode = (text: string, url: string, format = 0): Node => ({
  type: "link",
  ...base,
  fields: {
    linkType: "custom",
    url,
    newTab: url.startsWith("http"),
  },
  children: [textNode(text, format)],
});

/**
 * Inline parsing, one regex, alternation ordered longest-first.
 *
 * Links come before emphasis so that a link whose label contains ** is not
 * torn in half; code comes before both because backticks mean "do not
 * interpret what is inside me".
 */
const INLINE =
  /(\[[^\]]+\]\([^)\s]+\))|(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;

function inline(raw: string): Node[] {
  const nodes: Node[] = [];
  let cursor = 0;

  for (const match of raw.matchAll(INLINE)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(textNode(raw.slice(cursor, index)));

    const token = match[0];

    if (token.startsWith("[")) {
      const split = token.indexOf("](");
      nodes.push(linkNode(token.slice(1, split), token.slice(split + 2, -1)));
    } else if (token.startsWith("`")) {
      nodes.push(textNode(token.slice(1, -1), CODE));
    } else if (token.startsWith("**")) {
      nodes.push(textNode(token.slice(2, -2), BOLD));
    } else {
      nodes.push(textNode(token.slice(1, -1), ITALIC));
    }

    cursor = index + token.length;
  }

  if (cursor < raw.length) nodes.push(textNode(raw.slice(cursor)));
  return nodes.length ? nodes : [textNode(raw)];
}

const paragraph = (raw: string): Node => ({
  type: "paragraph",
  ...base,
  textFormat: 0,
  children: inline(raw),
});

const heading = (raw: string, tag: "h2" | "h3"): Node => ({
  type: "heading",
  ...base,
  tag,
  children: inline(raw),
});

const quote = (raw: string): Node => ({
  type: "quote",
  ...base,
  children: inline(raw),
});

const listItem = (raw: string, value: number): Node => ({
  type: "listitem",
  ...base,
  value,
  children: inline(raw),
});

const list = (items: string[], ordered: boolean): Node => ({
  type: "list",
  ...base,
  listType: ordered ? "number" : "bullet",
  start: 1,
  tag: ordered ? "ol" : "ul",
  children: items.map((item, i) => listItem(item, i + 1)),
});

const horizontalRule = (): Node => ({ type: "horizontalrule", ...base, version: 1 });

export function markdownToLexical(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const children: Node[] = [];

  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let listOrdered = false;

  const flushParagraph = () => {
    if (!paragraphBuffer.length) return;
    children.push(paragraph(paragraphBuffer.join(" ").trim()));
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (!listBuffer.length) return;
    children.push(list(listBuffer, listOrdered));
    listBuffer = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushAll();
      continue;
    }

    if (trimmed === "---") {
      flushAll();
      children.push(horizontalRule());
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushAll();
      children.push(heading(trimmed.slice(4), "h3"));
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushAll();
      children.push(heading(trimmed.slice(3), "h2"));
      continue;
    }

    if (trimmed.startsWith("> ")) {
      flushAll();
      children.push(quote(trimmed.slice(2)));
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(trimmed);
    if (bullet) {
      flushParagraph();
      if (listBuffer.length && listOrdered) flushList();
      listOrdered = false;
      listBuffer.push(bullet[1]);
      continue;
    }

    const numbered = /^\d+\.\s+(.*)$/.exec(trimmed);
    if (numbered) {
      flushParagraph();
      if (listBuffer.length && !listOrdered) flushList();
      listOrdered = true;
      listBuffer.push(numbered[1]);
      continue;
    }

    flushList();
    paragraphBuffer.push(trimmed);
  }

  flushAll();

  return {
    root: {
      type: "root",
      ...base,
      children,
    },
  };
}
