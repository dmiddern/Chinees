# Chinese Wiki Local

Een lokale, reclamevrije lezer voor de exacte inhoud van de pagina `Chinese` op de Duolingo Wiki.

De toepassing:

- haalt de actuele pagina server-side op via de MediaWiki-API;
- bewaart de oorspronkelijke tekst, tabellen, links, afbeeldingen en verwijzingen;
- verwijdert scripts, advertenties en Fandom-navigatie;
- toont bronvermelding en revisiegeschiedenis;
- bevat zoeken op Chinese tekens, pinyin en Engelse tekst;
- vereist geen GitHub-, Vercel-, Supabase- of ander account.

## Vereisten

Installeer Node.js 20 of nieuwer.

Controleer dit met:

```bash
node --version
npm --version
```

## Lokaal starten

```bash
npm install
npm run dev
```

Open daarna:

```text
http://localhost:3000
```

De eerste keer dat de pagina opent, moet je computer internettoegang hebben om de wiki-inhoud op te halen.

## Productieversie lokaal testen

```bash
npm run build
npm run start
```

## Optionele configuratie

De standaardinstellingen werken zonder `.env.local`. Om ze expliciet in te stellen:

```bash
cp .env.example .env.local
```

Beschikbare variabelen:

```env
WIKI_PAGE=Chinese
WIKI_API_URL=https://duolingo.fandom.com/api.php
```

## Later in een nieuwe Git-repository zetten

Voer dit pas uit in de map wanneer je een volledig aparte repository wilt starten:

```bash
git init
git add .
git commit -m "Initial local Chinese wiki reader"
```

Koppel daarna pas je nieuwe, afzonderlijke remote repository.

## Belangrijk over inhoud en licentie

Deze repository bevat de reader-software. De wiki-inhoud wordt bij gebruik opgehaald van de oorspronkelijke bron en blijft onderworpen aan de licentie- en bronvermeldingsvoorwaarden van de bronpagina. De toepassing behoudt links naar de oorspronkelijke pagina en revisiegeschiedenis. Dit project is niet verbonden aan Duolingo of Fandom.
