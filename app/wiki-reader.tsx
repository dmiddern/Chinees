"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type WikiSection = {
  anchor: string;
  index: string;
  level: string;
  line: string;
  number: string;
};

export type WikiPayload = {
  error?: string;
  fetchedAt?: string;
  historyUrl: string;
  html?: string;
  revisionId?: number | null;
  sections?: WikiSection[];
  snapshotDate?: string;
  sourceUrl: string;
  title?: string;
};

const SOURCE_URL = "https://duolingo.fandom.com/wiki/Chinese";
const HISTORY_URL =
  "https://duolingo.fandom.com/wiki/Chinese?action=history";

function BookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4.75 5.5A2.75 2.75 0 0 1 7.5 2.75H20v15.5H7.5a2.75 2.75 0 0 0-2.75 2.75V5.5Z" />
      <path d="M4.75 21A2.75 2.75 0 0 1 7.5 18.25H20M8.5 7.25h7M8.5 11h5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M14 5h5v5M11 13l8-8M19 13v6H5V5h6" />
    </svg>
  );
}

function stripUnsafeHtml(rawHtml: string) {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(rawHtml, "text/html");
  documentNode
    .querySelectorAll(
      "script,style,iframe,object,embed,form,input,button,textarea,select",
    )
    .forEach((element) => element.remove());

  documentNode.querySelectorAll("*").forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.startsWith("on")) {
        element.removeAttribute(attribute.name);
      }
    }
  });

  documentNode.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href") ?? "";
    if (href.startsWith("/")) {
      link.href = `https://duolingo.fandom.com${href}`;
    }
    if (!["http:", "https:", "mailto:"].includes(link.protocol)) {
      link.removeAttribute("href");
    }
    link.target = "_blank";
    link.rel = "noreferrer noopener";
  });

  documentNode.querySelectorAll("img").forEach((image) => {
    const source = image.getAttribute("src") ?? image.dataset.src ?? "";
    if (source.startsWith("//")) image.src = `https:${source}`;
    if (source.startsWith("/")) {
      image.src = `https://duolingo.fandom.com${source}`;
    }
    image.loading = "lazy";
  });

  return documentNode.body.innerHTML;
}

async function fetchDirectlyFromFandom(): Promise<WikiPayload> {
  const params = new URLSearchParams({
    action: "parse",
    format: "json",
    origin: "*",
    page: "Chinese",
    prop: "text|displaytitle|sections|revid",
  });
  const response = await fetch(
    `https://duolingo.fandom.com/api.php?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Fandom antwoordde met status ${response.status}.`);
  }
  const data = await response.json();
  const rawHtml = data?.parse?.text?.["*"];
  if (!rawHtml) throw new Error("De wiki gaf geen leesbare inhoud terug.");
  return {
    fetchedAt: new Date().toISOString(),
    historyUrl: HISTORY_URL,
    html: stripUnsafeHtml(rawHtml),
    revisionId: data.parse.revid ?? null,
    sections: data.parse.sections ?? [],
    sourceUrl: SOURCE_URL,
    title: data.parse.displaytitle ?? data.parse.title ?? "Chinese",
  };
}

export default function WikiReader({
  initialPayload,
}: {
  initialPayload: WikiPayload;
}) {
  const [payload, setPayload] = useState<WikiPayload | null>(initialPayload);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [imagesVisible, setImagesVisible] = useState(true);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const contentRef = useRef<HTMLElement>(null);

  const loadWiki = useCallback(async () => {
    setLoading(true);
    setPayload(null);
    try {
      const response = await fetch("/wiki-data");
      if (response.ok) {
        setPayload((await response.json()) as WikiPayload);
      } else {
        setPayload(await fetchDirectlyFromFandom());
      }
    } catch (serverError) {
      try {
        setPayload(await fetchDirectlyFromFandom());
      } catch {
        setPayload({
          error:
            serverError instanceof Error
              ? serverError.message
              : "De wiki-inhoud kon niet worden opgehaald.",
          historyUrl: HISTORY_URL,
          sourceUrl: SOURCE_URL,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    container.querySelectorAll("mark[data-search-hit]").forEach((mark) => {
      mark.replaceWith(document.createTextNode(mark.textContent ?? ""));
    });
    container.normalize();

    const search = query.trim();
    if (search.length < 2) {
      const frame = window.requestAnimationFrame(() => setMatchCount(0));
      return () => window.cancelAnimationFrame(frame);
    }

    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.textContent?.toLocaleLowerCase().includes(search.toLocaleLowerCase())) {
            return NodeFilter.FILTER_REJECT;
          }
          if (node.parentElement?.closest("script, style, mark")) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);

    let total = 0;
    nodes.forEach((node) => {
      const text = node.textContent ?? "";
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      for (const match of text.matchAll(regex)) {
        const index = match.index ?? 0;
        fragment.append(text.slice(lastIndex, index));
        const mark = document.createElement("mark");
        mark.dataset.searchHit = "true";
        mark.textContent = match[0];
        fragment.append(mark);
        lastIndex = index + match[0].length;
        total += 1;
      }
      fragment.append(text.slice(lastIndex));
      node.replaceWith(fragment);
    });
    const frame = window.requestAnimationFrame(() => setMatchCount(total));
    container
      .querySelector<HTMLElement>("mark[data-search-hit]")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    return () => window.cancelAnimationFrame(frame);
  }, [query, payload?.html]);

  const visibleSections = useMemo(
    () =>
      (payload?.sections ?? []).filter(
        (section) => Number(section.level) <= 3,
      ),
    [payload?.sections],
  );

  const fetchedLabel = payload?.fetchedAt
    ? new Intl.DateTimeFormat("nl-BE", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(payload.fetchedAt))
    : null;
  const snapshotLabel = payload?.snapshotDate
    ? new Intl.DateTimeFormat("nl-BE", { dateStyle: "long" }).format(
        new Date(`${payload.snapshotDate}T12:00:00Z`),
      )
    : null;

  return (
    <main className={imagesVisible ? "" : "hide-wiki-images"}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Naar boven">
          <span className="brand-mark">
            <BookIcon />
          </span>
          <span>
            <strong>中文</strong>
            <small>Chinese Wiki, zonder afleiding</small>
          </span>
        </a>
        <nav aria-label="Hoofdnavigatie">
          <a href="#inhoud">Inhoud</a>
          <a href="#bronnen">Bronnen</a>
          <a href={SOURCE_URL} target="_blank" rel="noreferrer">
            Origineel <ExternalIcon />
          </a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Mandarijn · vereenvoudigde karakters</p>
          <h1>Leer Chinees zonder reclame of ruis.</h1>
          <p>
            De exacte inhoud van de Chinese-pagina op Duolingo Wiki, in een
            rustige leesomgeving. Alle tabellen, woordenlijsten, verwijzingen
            en bronlinks blijven behouden.
          </p>
        </div>
        <div className="hanzi-card" aria-hidden="true">
          <span>学</span>
          <small>xué · leren</small>
        </div>
      </section>

      <section className="reader-toolbar" aria-label="Leeshulpmiddelen">
        <label className="search-field">
          <SearchIcon />
          <span className="sr-only">Zoek in de Chinese wiki-inhoud</span>
          <input
            type="search"
            placeholder="Zoek op 汉字, pinyin of Engelse tekst…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query.trim().length >= 2 && (
            <small>{matchCount} resultaten</small>
          )}
        </label>
        <button
          className="toolbar-button"
          type="button"
          onClick={() => setImagesVisible((visible) => !visible)}
          aria-pressed={!imagesVisible}
        >
          {imagesVisible ? "Afbeeldingen verbergen" : "Afbeeldingen tonen"}
        </button>
        <button
          className="toolbar-button toc-button"
          type="button"
          onClick={() => setIsTocOpen((open) => !open)}
          aria-expanded={isTocOpen}
        >
          Inhoudsopgave
        </button>
      </section>

      <div className="reader-layout" id="inhoud">
        <aside className={isTocOpen ? "toc toc-open" : "toc"}>
          <div className="toc-heading">
            <p className="eyebrow">Op deze pagina</p>
            <button
              type="button"
              onClick={() => setIsTocOpen(false)}
              aria-label="Inhoudsopgave sluiten"
            >
              ×
            </button>
          </div>
          {visibleSections.length > 0 ? (
            <ol>
              {visibleSections.map((section) => (
                <li
                  key={`${section.index}-${section.anchor}`}
                  className={`toc-level-${section.level}`}
                >
                  <a
                    href={`#${section.anchor}`}
                    onClick={() => setIsTocOpen(false)}
                    dangerouslySetInnerHTML={{ __html: section.line }}
                  />
                </li>
              ))}
            </ol>
          ) : (
            <p className="toc-muted">
              De inhoudsopgave verschijnt zodra de wiki geladen is.
            </p>
          )}
        </aside>

        <article className="wiki-shell">
          <div className="wiki-meta">
            <div>
              <p className="eyebrow">Duolingo Wiki · Chinese</p>
              <h2
                dangerouslySetInnerHTML={{
                  __html: payload?.title ?? "Chinese",
                }}
              />
            </div>
            {payload?.revisionId && (
              <span>Revisie {payload.revisionId}</span>
            )}
          </div>

          {loading && (
            <div className="state-card" aria-live="polite">
              <div className="loader" />
              <h3>De wiki-inhoud wordt opgehaald</h3>
              <p>Even geduld. Dit kan enkele seconden duren.</p>
            </div>
          )}

          {!loading && payload?.error && (
            <div className="state-card error-card" role="alert">
              <span className="state-symbol">文</span>
              <h3>De bron laat de inhoud momenteel niet door</h3>
              <p>
                Fandom blokkeert soms geautomatiseerde verzoeken. Probeer
                opnieuw of open tijdelijk de oorspronkelijke pagina.
              </p>
              <small className="error-detail">{payload.error}</small>
              <div className="state-actions">
                <button type="button" onClick={loadWiki}>
                  Opnieuw proberen
                </button>
                <a href={SOURCE_URL} target="_blank" rel="noreferrer">
                  Open de bron <ExternalIcon />
                </a>
              </div>
            </div>
          )}

          {payload?.html && (
            <section
              ref={contentRef}
              className="wiki-content"
              dangerouslySetInnerHTML={{ __html: payload.html }}
            />
          )}
        </article>
      </div>

      <footer id="bronnen">
        <div className="footer-grid">
          <div>
            <p className="eyebrow">Bron en licentie</p>
            <p>
              Deze website bevat materiaal van{" "}
              <a href={SOURCE_URL} target="_blank" rel="noreferrer">
                “Chinese” op Duolingo Wiki
              </a>
              . De inhoud en oorspronkelijke bijdragers zijn beschikbaar via
              de bronpagina en paginageschiedenis en worden hergebruikt onder{" "}
              <a
                href="https://creativecommons.org/licenses/by-sa/3.0/"
                target="_blank"
                rel="noreferrer"
              >
                CC BY-SA 3.0
              </a>
              .
            </p>
          </div>
          <div>
            <p className="eyebrow">Transparantie</p>
            <p>
              Structuur en vormgeving zijn aangepast. Deze website is niet
              verbonden aan of goedgekeurd door Duolingo of Fandom.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            {fetchedLabel
              ? `Inhoud opgehaald op ${fetchedLabel}`
              : snapshotLabel
                ? `Betrouwbare momentopname van ${snapshotLabel}`
                : "Wiki-inhoud"}
          </span>
          <div>
            <a href={HISTORY_URL} target="_blank" rel="noreferrer">
              Paginageschiedenis
            </a>
            <a href={SOURCE_URL} target="_blank" rel="noreferrer">
              Originele pagina
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
