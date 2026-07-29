# Chinese Wiki Clean

Een rustige, reclamevrije leesomgeving voor de exacte inhoud van de pagina “Chinese” op Duolingo Wiki.

Live versie: https://chinese-wiki-clean.dmiddern.chatgpt.site

## Functies

- actuele import via de MediaWiki API
- extra readerfallback wanneer Fandom serververzoeken blokkeert
- ingebouwde momentopname zodat de inhoud altijd beschikbaar blijft
- server-side opschoning van externe HTML
- zoeken in Chinese karakters, pinyin en Engelse tekst
- mobiele inhoudsopgave
- optie om afbeeldingen te verbergen
- behoud van tabellen, links, referenties en paginageschiedenis
- zichtbare CC BY-SA 3.0-bronvermelding

## Lokaal starten

```bash
npm install
npm run dev
```

Open daarna `http://localhost:3000`.

## Vercel

Importeer deze repository in Vercel. Er zijn geen omgevingsvariabelen of externe accounts nodig voor de basisversie.

## Bron en licentie

De wiki-inhoud blijft eigendom van de oorspronkelijke bijdragers en wordt hergebruikt onder [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Deze codebase en vormgeving zijn niet verbonden aan of goedgekeurd door Duolingo of Fandom.
