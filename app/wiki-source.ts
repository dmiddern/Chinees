import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { FALLBACK_MARKDOWN } from "./wiki-fallback";

const API_URL = "https://duolingo.fandom.com/api.php";
const SOURCE_URL = "https://duolingo.fandom.com/wiki/Chinese";
const HISTORY_URL =
  "https://duolingo.fandom.com/wiki/Chinese?action=history";
const READER_URL =
  "https://r.jina.ai/https://duolingo.fandom.com/wiki/Chinese";

type WikiSection = {
  anchor: string;
  index: string;
  level: string;
  line: string;
  number: string;
};

type ParseResponse = {
  error?: { code?: string; info?: string };
  parse?: {
    displaytitle?: string;
    revid?: number;
    sections?: WikiSection[];
    text?: { "*": string };
    title?: string;
  };
};

function absoluteWikiUrl(value: string) {
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return `https://duolingo.fandom.com${value}`;
  return value;
}

function cleanWikiHtml(rawHtml: string) {
  return sanitizeHtml(rawHtml, {
    allowedTags: [
      "a",
      "abbr",
      "b",
      "blockquote",
      "br",
      "caption",
      "cite",
      "code",
      "dd",
      "del",
      "details",
      "div",
      "dl",
      "dt",
      "em",
      "figcaption",
      "figure",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr",
      "i",
      "img",
      "kbd",
      "li",
      "mark",
      "ol",
      "p",
      "pre",
      "q",
      "s",
      "section",
      "small",
      "span",
      "strong",
      "sub",
      "summary",
      "sup",
      "table",
      "tbody",
      "td",
      "tfoot",
      "th",
      "thead",
      "tr",
      "u",
      "ul",
    ],
    allowedAttributes: {
      "*": ["class", "dir", "id", "lang", "title"],
      a: ["href", "rel", "target"],
      img: [
        "alt",
        "data-src",
        "decoding",
        "height",
        "loading",
        "src",
        "srcset",
        "width",
      ],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan", "scope"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          href: absoluteWikiUrl(attribs.href ?? SOURCE_URL),
          rel: "noreferrer noopener",
          target: "_blank",
        },
      }),
      img: (_tagName, attribs) => ({
        tagName: "img",
        attribs: {
          ...attribs,
          alt: attribs.alt ?? "",
          loading: "lazy",
          src: absoluteWikiUrl(attribs.src ?? attribs["data-src"] ?? ""),
        },
      }),
    },
    exclusiveFilter(frame) {
      const classes = frame.attribs?.class ?? "";
      return [
        "mw-editsection",
        "mw-empty-elt",
        "navbox",
        "portable-infobox",
        "reference-backlink",
      ].some((className) => classes.includes(className));
    },
  });
}

async function fetchMediaWiki() {
  const params = new URLSearchParams({
    action: "parse",
    format: "json",
    origin: "*",
    page: "Chinese",
    prop: "text|displaytitle|sections|revid",
  });

  const response = await fetch(`${API_URL}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "ChineseWikiClean/1.0 (educational reader; github.com/dmiddern/VBA)",
    },
  });

  if (!response.ok) {
    throw new Error(`Fandom antwoordde met status ${response.status}.`);
  }

  const data = (await response.json()) as ParseResponse;
  if (data.error || !data.parse?.text?.["*"]) {
    throw new Error(
      data.error?.info ?? "De Chinese-wikipagina bevatte geen leesbare inhoud.",
    );
  }

  return {
    fetchedAt: new Date().toISOString(),
    historyUrl: HISTORY_URL,
    html: cleanWikiHtml(data.parse.text["*"]),
    retrievalMode: "mediawiki-api",
    revisionId: data.parse.revid ?? null,
    sections: data.parse.sections ?? [],
    sourceUrl: SOURCE_URL,
    title: data.parse.displaytitle ?? data.parse.title ?? "Chinese",
  };
}

function plainText(value: string) {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function slugify(value: string) {
  return plainText(value)
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

async function fetchReaderMirror() {
  const response = await fetch(READER_URL, {
    headers: {
      Accept: "text/plain",
      "User-Agent":
        "ChineseWikiClean/1.0 (educational reader; github.com/dmiddern/VBA)",
    },
  });

  if (!response.ok) {
    throw new Error(`De readerfallback antwoordde met status ${response.status}.`);
  }

  const markdown = await response.text();
  return renderMarkdownPayload(extractArticleMarkdown(markdown), {
    fetchedAt: new Date().toISOString(),
    retrievalMode: "reader-fallback",
  });
}

function extractArticleMarkdown(markdown: string) {
  const start = markdown.indexOf("## Chinese");
  const conversation = markdown.indexOf("### Join the conversation", start);
  const privacy = markdown.indexOf(
    "## Do Not Sell or Share My Personal Data",
    start,
  );
  const endCandidates = [conversation, privacy].filter((value) => value > start);
  const end =
    endCandidates.length > 0 ? Math.min(...endCandidates) : markdown.length;

  if (start < 0 || end <= start) {
    throw new Error("De readerfallback bevatte geen herkenbare Chinese-pagina.");
  }

  return markdown
    .slice(start, end)
    .replace(/^## Chinese\s*/u, "")
    .replace(
      /\[\[\]\(https:\/\/auth\.fandom\.com\/signin\?[^)]*\)\]/gu,
      "",
    )
    .trim();
}

async function renderMarkdownPayload(
  articleMarkdown: string,
  metadata:
    | { fetchedAt: string; retrievalMode: "reader-fallback" }
    | { retrievalMode: "bundled-snapshot"; snapshotDate: string },
) {
  const rendered = await marked.parse(articleMarkdown, {
    gfm: true,
    breaks: false,
  });
  const sections: WikiSection[] = [];
  const usedAnchors = new Map<string, number>();
  let sectionIndex = 0;
  const withHeadingIds = rendered.replace(
    /<h([23])>([\s\S]*?)<\/h\1>/giu,
    (_match, level: string, contents: string) => {
      const baseAnchor = slugify(contents) || `section-${sectionIndex + 1}`;
      const occurrence = usedAnchors.get(baseAnchor) ?? 0;
      usedAnchors.set(baseAnchor, occurrence + 1);
      const anchor =
        occurrence === 0 ? baseAnchor : `${baseAnchor}-${occurrence + 1}`;
      sectionIndex += 1;
      sections.push({
        anchor,
        index: String(sectionIndex),
        level,
        line: plainText(contents),
        number: String(sectionIndex),
      });
      return `<h${level} id="${anchor}">${contents}</h${level}>`;
    },
  );

  return {
    ...metadata,
    historyUrl: HISTORY_URL,
    html: cleanWikiHtml(withHeadingIds),
    revisionId: null,
    sections,
    sourceUrl: SOURCE_URL,
    title: "Chinese",
  };
}

export async function getWikiPayload() {
  try {
    return await fetchMediaWiki();
  } catch {
    try {
      return await fetchReaderMirror();
    } catch {
      return getBundledWikiPayload();
    }
  }
}

export function getBundledWikiPayload() {
  return renderMarkdownPayload(
    FALLBACK_MARKDOWN.trim().replace(/^## Chinese\s*/u, "").trim(),
    {
      retrievalMode: "bundled-snapshot",
      snapshotDate: "2026-07-29",
    },
  );
}
