import { NextResponse } from "next/server";
import { getWikiPayload } from "../wiki-source";

const SOURCE_URL = "https://duolingo.fandom.com/wiki/Chinese";
const HISTORY_URL =
  "https://duolingo.fandom.com/wiki/Chinese?action=history";

export async function GET() {
  try {
    return NextResponse.json(await getWikiPayload(), {
      headers: {
        "Cache-Control":
          "public, max-age=900, s-maxage=21600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "De wiki-inhoud kon niet worden opgehaald.",
        historyUrl: HISTORY_URL,
        sourceUrl: SOURCE_URL,
      },
      { status: 502 },
    );
  }
}
