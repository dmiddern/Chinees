import WikiReader, { type WikiPayload } from "./wiki-reader";
import { getBundledWikiPayload } from "./wiki-source";

export default async function Home() {
  let initialPayload: WikiPayload;
  try {
    initialPayload = await getBundledWikiPayload();
  } catch (error) {
    initialPayload = {
      error:
        error instanceof Error
          ? error.message
          : "De wiki-inhoud kon niet worden opgehaald.",
      historyUrl: "https://duolingo.fandom.com/wiki/Chinese?action=history",
      sourceUrl: "https://duolingo.fandom.com/wiki/Chinese",
    };
  }
  return <WikiReader initialPayload={initialPayload} />;
}
