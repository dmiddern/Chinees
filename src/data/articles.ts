import { extendedArticles } from "./extendedArticles";
import { enrichArticle } from "./articleEnrichment";

export type ArticleLevel = "Start" | "Basis" | "Verdieping" | "Gevorderd";
export type ArticleKind = "Uitspraak" | "Schrift" | "Grammatica" | "Praktijk";

export interface ArticleExample {
  chinese: string;
  pinyin: string;
  dutch: string;
  note?: string;
  analysis?: string;
}

export interface ArticleDialogueLine extends ArticleExample {
  speaker: string;
}

export interface ArticleExercise {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface Article {
  id: string;
  order: number;
  level: ArticleLevel;
  hsk: string;
  kind: ArticleKind;
  title: string;
  chineseTitle: string;
  summary: string;
  minutes: number;
  explanation: string[];
  patterns: { formula: string; meaning: string }[];
  examples: ArticleExample[];
  remember: string[];
  deepDive?: string[];
  pitfalls?: string[];
  practiceSteps?: string[];
  dialogue?: ArticleDialogueLine[];
  culture?: string[];
  exercises?: ArticleExercise[];
}

const article = (
  id: string,
  order: number,
  level: ArticleLevel,
  hsk: string,
  kind: ArticleKind,
  title: string,
  chineseTitle: string,
  summary: string,
  minutes: number,
  explanation: string[],
  patterns: { formula: string; meaning: string }[],
  examples: ArticleExample[],
  remember: string[],
): Article => ({
  id,
  order,
  level,
  hsk,
  kind,
  title,
  chineseTitle,
  summary,
  minutes,
  explanation,
  patterns,
  examples,
  remember,
});

const coreArticles: Article[] = [
  article(
    "karakters-lezen",
    1,
    "Start",
    "Voor HSK 1",
    "Schrift",
    "Hoe Chinese karakters werken",
    "汉字",
    "Leer een karakter zien als een combinatie van betekenis, klank en vaste bouwstenen.",
    7,
    [
      "Een Chinees karakter stelt meestal geen losse letter voor, maar één betekenisdragende lettergreep. Een woord kan uit één karakter bestaan, zoals 人 rén, mens, maar heel vaak uit twee of meer karakters, zoals 中国 Zhōngguó, China.",
      "Karakters zijn opgebouwd uit componenten. Eén component kan de betekenisrichting aangeven en een andere kan een aanwijzing voor de uitspraak geven. Dat systeem is niet volledig voorspelbaar, maar het helpt wel om nieuwe karakters te onthouden.",
      "Leer daarom niet alleen de vorm. Koppel elk nieuw woord meteen aan uitspraak, betekenis en een voorbeeldzin. De schrijfvolgorde helpt je om de vorm als een logisch bewegingspatroon te onthouden.",
    ],
    [
      { formula: "氵 + 青 → 清", meaning: "De watercomponent 氵 geeft een betekenisrichting: helder of zuiver." },
      { formula: "女 + 马 → 妈", meaning: "女 verwijst naar vrouw; 马 geeft hier vooral een klankaanwijzing." },
    ],
    [
      { chinese: "人", pinyin: "rén", dutch: "mens, persoon" },
      { chinese: "人口", pinyin: "rénkǒu", dutch: "bevolking", note: "Letterlijk: mensen + monden." },
      { chinese: "中国人", pinyin: "Zhōngguó rén", dutch: "Chinees persoon" },
    ],
    [
      "Een karakter is niet hetzelfde als een woord.",
      "Leer woorden in hun geheel, maar herken tegelijk de componenten.",
      "Schrijf van boven naar beneden en meestal van links naar rechts.",
    ],
  ),
  article(
    "pinyin",
    2,
    "Start",
    "Voor HSK 1",
    "Uitspraak",
    "Pinyin correct lezen",
    "拼音",
    "Pinyin gebruikt het Latijnse alfabet, maar de letters klinken niet altijd zoals in het Nederlands.",
    8,
    [
      "Pinyin is een notatiesysteem voor de uitspraak van Standaardmandarijn. Elke lettergreep bestaat uit een beginklank, een eindklank en een toon. Lees pinyin niet alsof het Nederlands of Engels is.",
      "Vooral j, q en x vragen aandacht. Ze worden met de tong vooraan uitgesproken. Zh, ch en sh klinken verder naar achteren in de mond. De letter c klinkt ongeveer als ts met extra lucht.",
      "De ü-klank blijft bestaan na j, q en x, ook wanneer de twee puntjes niet geschreven worden. Qu wordt dus niet uitgesproken als Nederlandse koe, maar ongeveer als tsjuu met ronde lippen.",
    ],
    [
      { formula: "beginletter + eindklank + toon", meaning: "m + a + derde toon = mǎ" },
      { formula: "j / q / x + u", meaning: "De geschreven u staat hier voor ü." },
    ],
    [
      { chinese: "妈妈", pinyin: "māma", dutch: "mama" },
      { chinese: "去", pinyin: "qù", dutch: "gaan" },
      { chinese: "学习", pinyin: "xuéxí", dutch: "studeren, leren" },
    ],
    [
      "Luister eerst, imiteer daarna en lees pas dan de letters.",
      "Oefen verwarrende reeksen samen: j-q-x, zh-ch-sh en z-c-s.",
      "Spreek elke nieuwe woordenlijst hardop uit.",
    ],
  ),
  article(
    "tonen",
    3,
    "Start",
    "Voor HSK 1",
    "Uitspraak",
    "De vier tonen en de neutrale toon",
    "声调",
    "Toon is onderdeel van het woord. Een andere toon kan dus een andere betekenis opleveren.",
    8,
    [
      "Mandarijn heeft vier basistonen en een lichte, neutrale toon. De eerste toon blijft hoog en vlak. De tweede stijgt. De derde blijft meestal laag en stijgt alleen duidelijk wanneer hij geïsoleerd staat. De vierde valt kort en krachtig.",
      "Een toon is geen versiering achteraf. Leer mā, má, mǎ en mà als vier verschillende klankvormen. In natuurlijke zinnen veranderen de precieze tooncontouren, maar de onderlinge contrasten blijven belangrijk.",
      "Neutrale lettergrepen zijn kort en licht. In 妈妈 māma heeft de tweede lettergreep geen volwaardige eerste toon, ook al is het karakter hetzelfde.",
    ],
    [
      { formula: "1: ā · 2: á · 3: ǎ · 4: à · licht: a", meaning: "De vijf toonnotaties in pinyin." },
      { formula: "toon + lettergreep", meaning: "Leer altijd beide samen als één uitspraakgeheel." },
    ],
    [
      { chinese: "妈 / 麻 / 马 / 骂", pinyin: "mā / má / mǎ / mà", dutch: "mama / hennep / paard / uitschelden" },
      { chinese: "很好", pinyin: "hěn hǎo", dutch: "heel goed" },
      { chinese: "爸爸", pinyin: "bàba", dutch: "papa", note: "De tweede lettergreep is neutraal." },
    ],
    [
      "Denk bij de derde toon eerst aan laag, niet aan een overdreven daling en stijging.",
      "Oefen toonparen, niet alleen losse lettergrepen.",
      "Neem jezelf af en toe op om toonhoogte en ritme te controleren.",
    ],
  ),
  article(
    "toonveranderingen",
    4,
    "Start",
    "HSK 1",
    "Uitspraak",
    "Toonveranderingen in echte zinnen",
    "变调",
    "Sommige tonen veranderen voorspelbaar wanneer woorden naast elkaar staan.",
    6,
    [
      "Twee derde tonen na elkaar worden niet allebei volledig laag uitgesproken. De eerste klinkt dan als een tweede toon. 你好 wordt daarom uitgesproken als ní hǎo, hoewel je nog steeds nǐ hǎo schrijft.",
      "不 bù verandert voor een vierde toon meestal in bú. 一 yī verandert afhankelijk van de volgende toon. Deze veranderingen maken de uitspraak vloeiender.",
      "De spelling in pinyin toont meestal de woordenboektoon. Leer dus zowel de vaste woordenboekvorm als de natuurlijke uitspraak in een zin.",
    ],
    [
      { formula: "3 + 3 → 2 + 3", meaning: "De eerste derde toon wordt stijgend." },
      { formula: "不 + 4 → bú + 4", meaning: "Bù wordt bú vóór een vierde toon." },
      { formula: "一 + 1/2/3 → yì · 一 + 4 → yí", meaning: "Yī past zich aan de volgende toon aan." },
    ],
    [
      { chinese: "你好", pinyin: "nǐ hǎo → ní hǎo", dutch: "hallo" },
      { chinese: "不是", pinyin: "bù shì → bú shì", dutch: "niet zijn" },
      { chinese: "一个", pinyin: "yī ge → yí ge", dutch: "één stuk" },
    ],
    [
      "Schrijf de woordenboektoon, maar spreek de veranderde toon uit.",
      "Leer veelgebruikte combinaties als één ritmisch geheel.",
    ],
  ),
  article(
    "basiszinsvolgorde",
    5,
    "Basis",
    "HSK 1",
    "Grammatica",
    "De basiszinsvolgorde",
    "基本语序",
    "Chinese zinnen zijn voorspelbaar: onderwerp, tijd, plaats, manier en pas dan de handeling.",
    9,
    [
      "De neutrale basis is onderwerp + werkwoord + voorwerp. Bepalingen die vertellen wanneer, waar of hoe iets gebeurt, komen meestal vóór het werkwoord.",
      "Dat verschilt van het Nederlands. Wij zeggen gemakkelijk 'ik studeer morgen thuis'. In het Chinees zet je de context eerst klaar: ik + morgen + thuis + Chinees studeren.",
      "Een handige uitgebreide volgorde is: onderwerp + tijd + plaats + bijwoord + werkwoord + voorwerp. Niet elk onderdeel hoeft aanwezig te zijn.",
    ],
    [
      { formula: "Onderwerp + werkwoord + voorwerp", meaning: "我学中文。Ik leer Chinees." },
      { formula: "Onderwerp + tijd + plaats + manier + werkwoord + voorwerp", meaning: "Context staat normaal vóór de handeling." },
    ],
    [
      { chinese: "我学中文。", pinyin: "Wǒ xué Zhōngwén.", dutch: "Ik leer Chinees." },
      { chinese: "我明天在家认真学习中文。", pinyin: "Wǒ míngtiān zài jiā rènzhēn xuéxí Zhōngwén.", dutch: "Ik studeer morgen thuis aandachtig Chinees." },
      { chinese: "他每天坐地铁上班。", pinyin: "Tā měitiān zuò dìtiě shàngbān.", dutch: "Hij gaat elke dag met de metro naar het werk." },
    ],
    [
      "Zet tijd meestal vóór plaats.",
      "Zet het vraagwoord op de plek waar het antwoord zou staan.",
      "Bouw eerst een korte correcte zin en voeg daarna context toe.",
    ],
  ),
  article(
    "shi",
    6,
    "Basis",
    "HSK 1",
    "Grammatica",
    "Zijn met 是, en wanneer niet",
    "是",
    "Gebruik 是 om twee zelfstandige naamwoorden gelijk te stellen, niet voor elk Nederlands gebruik van zijn.",
    7,
    [
      "是 shì verbindt een onderwerp met een identiteit of categorie. 'Ik ben Belg' gebruikt 是, want 'ik' en 'Belg' worden gelijkgesteld.",
      "Bij een bijvoeglijk naamwoord gebruik je normaal geen 是. 'Hij is druk' wordt 他很忙, letterlijk ongeveer 'hij behoorlijk druk'. Een locatie gebruikt meestal 在 en bezit of bestaan gebruikt 有.",
      "De ontkenning van 是 is 不是. Voor gewone handelingen gebruik je meestal 不 vóór het werkwoord.",
    ],
    [
      { formula: "A + 是 + B", meaning: "A is B." },
      { formula: "A + 不是 + B", meaning: "A is B niet." },
      { formula: "Onderwerp + 很 + eigenschap", meaning: "Een neutrale beschrijving met een bijvoeglijk naamwoord." },
    ],
    [
      { chinese: "我是比利时人。", pinyin: "Wǒ shì Bǐlìshí rén.", dutch: "Ik ben Belg." },
      { chinese: "他不是老师。", pinyin: "Tā bú shì lǎoshī.", dutch: "Hij is geen leraar." },
      { chinese: "她很忙。", pinyin: "Tā hěn máng.", dutch: "Zij is druk.", note: "Geen 是 vóór 忙." },
    ],
    [
      "Gebruik 是 voor identiteit en classificatie.",
      "Gebruik geen 是 vóór een gewone eigenschap.",
      "Vertaal het Nederlandse werkwoord zijn niet automatisch woord voor woord.",
    ],
  ),
  article(
    "hen-adjectieven",
    7,
    "Basis",
    "HSK 1",
    "Grammatica",
    "Eigenschappen met 很",
    "很 + 形容词",
    "Chinese bijvoeglijke naamwoorden kunnen zelf het gezegde vormen. 很 klinkt daarbij vaak neutraler dan heel.",
    7,
    [
      "Woorden als goed, groot en duur gedragen zich in het Chinees als statieve werkwoorden. Je hebt dus geen apart woord voor zijn nodig.",
      "Een kale vorm als 他忙 is grammaticaal, maar klinkt vaak contrastief: hij is druk, in tegenstelling tot iemand anders. 很 maakt de uitspraak neutraler en betekent daardoor niet altijd nadrukkelijk heel.",
      "Andere graadwoorden nemen dezelfde positie in, zoals 非常 heel, 太 te, 真 echt en 有点 een beetje, vaak met een ongunstige nuance.",
    ],
    [
      { formula: "Onderwerp + 很 + eigenschap", meaning: "Neutrale beschrijving." },
      { formula: "太 + eigenschap + 了", meaning: "Te of erg, vaak als uitroep." },
      { formula: "有点 + eigenschap", meaning: "Een beetje, meestal minder positief." },
    ],
    [
      { chinese: "这个很好。", pinyin: "Zhège hěn hǎo.", dutch: "Dit is goed." },
      { chinese: "太贵了！", pinyin: "Tài guì le!", dutch: "Veel te duur!" },
      { chinese: "今天有点冷。", pinyin: "Jīntiān yǒudiǎn lěng.", dutch: "Vandaag is het wat koud." },
    ],
    [
      "很 is niet in elke zin een sterke nadruk.",
      "Laat 是 weg vóór een eigenschap.",
      "有点 staat vóór de eigenschap; 一点 staat vaak erna bij een vergelijking of verzoek.",
    ],
  ),
  article(
    "vragen",
    8,
    "Basis",
    "HSK 1",
    "Grammatica",
    "Vier manieren om een vraag te stellen",
    "疑问句",
    "Gebruik 吗, een vraagwoord, een A-niet-A-vorm of 呢 zonder de hele zin om te keren.",
    10,
    [
      "Voor een ja-neevraag kun je een gewone mededelende zin nemen en 吗 ma achteraan toevoegen. De woordvolgorde verandert niet.",
      "Vraagwoorden blijven op de plaats van de ontbrekende informatie. 'Wie is hij?' is letterlijk 'hij is wie?'. Dat is anders dan de Nederlandse inversie.",
      "Een A-niet-A-vraag herhaalt het werkwoord met een ontkenning ertussen. 呢 kan een verkorte wedervraag maken of een lopende situatie benadrukken.",
    ],
    [
      { formula: "Mededeling + 吗？", meaning: "Ja-neevraag." },
      { formula: "Werkwoord + 不 + werkwoord？", meaning: "Keuze tussen wel en niet." },
      { formula: "Vraagwoord op de antwoordplek", meaning: "什么, 谁, 哪儿, 什么时候 en 怎么 blijven in de zin." },
    ],
    [
      { chinese: "你喜欢茶吗？", pinyin: "Nǐ xǐhuan chá ma?", dutch: "Hou je van thee?" },
      { chinese: "你喜不喜欢茶？", pinyin: "Nǐ xǐ bu xǐhuan chá?", dutch: "Hou je wel of niet van thee?" },
      { chinese: "他是谁？", pinyin: "Tā shì shéi?", dutch: "Wie is hij?" },
      { chinese: "我很好，你呢？", pinyin: "Wǒ hěn hǎo, nǐ ne?", dutch: "Met mij gaat het goed, en met jou?" },
    ],
    [
      "Combineer 吗 niet met een vraagwoord zoals 谁.",
      "Draai onderwerp en werkwoord niet om.",
      "Gebruik A-niet-A vooral wanneer je een duidelijke keuze tussen ja en nee vraagt.",
    ],
  ),
  article(
    "ontkenning",
    9,
    "Basis",
    "HSK 1-2",
    "Grammatica",
    "Ontkennen met 不 en 没",
    "不 / 没",
    "不 ontkent gewoontes, intenties en algemene feiten. 没 ontkent voltooiing, ervaring of bezit.",
    9,
    [
      "不 bù wordt vooral gebruikt voor het heden, de toekomst, gewoontes en keuzes: ik drink geen koffie, ik ga morgen niet.",
      "没 méi of 没有 méiyǒu ontkent dat iets gebeurd of voltooid is. Het is ook de ontkenning van 有, hebben of bestaan.",
      "Een voltooide handeling met 了 wordt in de ontkenning meestal 没 + werkwoord. De 了 verdwijnt dan.",
    ],
    [
      { formula: "不 + werkwoord/eigenschap", meaning: "Niet als gewoonte, feit of keuze." },
      { formula: "没(有) + werkwoord", meaning: "Niet gebeurd of niet voltooid." },
      { formula: "没有 + zelfstandig naamwoord", meaning: "Niet hebben of er is niet." },
    ],
    [
      { chinese: "我不喝咖啡。", pinyin: "Wǒ bù hē kāfēi.", dutch: "Ik drink geen koffie." },
      { chinese: "我昨天没喝咖啡。", pinyin: "Wǒ zuótiān méi hē kāfēi.", dutch: "Ik heb gisteren geen koffie gedronken." },
      { chinese: "这里没有地铁。", pinyin: "Zhèlǐ méiyǒu dìtiě.", dutch: "Hier is geen metro." },
    ],
    [
      "Gebruik 没 voor een niet-gebeurde handeling in het verleden.",
      "Zet geen 了 achter een werkwoord dat met 没 ontkend wordt.",
      "不 kan wel naar het verleden verwijzen bij een bewuste weigering of gewoonte.",
    ],
  ),
  article(
    "de-bezit",
    10,
    "Basis",
    "HSK 1",
    "Grammatica",
    "Bezit en beschrijving met 的",
    "的",
    "Alles wat een zelfstandig naamwoord beschrijft, komt ervoor en wordt vaak met 的 verbonden.",
    8,
    [
      "的 de verbindt een bezitter of beschrijving met een zelfstandig naamwoord. De volgorde is dus 'van mij + boek' en niet 'boek + van mij'.",
      "Bij nauwe familiebanden en vaste combinaties kan 的 vaak weg: 我妈妈, mijn mama. Bij langere beschrijvingen blijft 的 belangrijk.",
      "Het beschreven zelfstandig naamwoord kan worden weggelaten wanneer het duidelijk is. 我的 betekent dan het mijne.",
    ],
    [
      { formula: "Bezitter + 的 + ding", meaning: "Mijn boek: 我的书." },
      { formula: "Beschrijving + 的 + zelfstandig naamwoord", meaning: "Een boek dat ik mooi vind." },
      { formula: "Bezitter + 的", meaning: "Het mijne, de jouwe, enzovoort." },
    ],
    [
      { chinese: "这是我的书。", pinyin: "Zhè shì wǒ de shū.", dutch: "Dit is mijn boek." },
      { chinese: "我妈妈是老师。", pinyin: "Wǒ māma shì lǎoshī.", dutch: "Mijn mama is leraar." },
      { chinese: "红色的是我的。", pinyin: "Hóngsè de shì wǒ de.", dutch: "De rode is van mij." },
    ],
    [
      "De hele beschrijving komt vóór het zelfstandig naamwoord.",
      "Laat 的 alleen weg in korte, hechte of vaste relaties.",
      "Verwar 的 niet met 得 en 地, die later andere functies krijgen.",
    ],
  ),
  article(
    "getallen-maatwoorden",
    11,
    "Basis",
    "HSK 1-2",
    "Grammatica",
    "Getallen, 两 en maatwoorden",
    "数量词",
    "Tussen een getal of aanwijzer en een zelfstandig naamwoord staat bijna altijd een maatwoord.",
    10,
    [
      "Je zegt in het Chinees niet simpelweg 'drie boeken', maar 'drie exemplaren boek': 三本书. Het maatwoord hangt af van de categorie of vorm van het ding.",
      "个 gè is het algemene maatwoord en vaak begrijpelijk, maar veel woorden hebben een gebruikelijker maatwoord, zoals 本 voor gebonden boeken, 杯 voor kopjes en 张 voor vlakke voorwerpen.",
      "Voor twee vóór een maatwoord gebruik je meestal 两 liǎng. 二 èr gebruik je in tellen, telefoonnummers, datums en rangtelwoorden.",
    ],
    [
      { formula: "Getal + maatwoord + zelfstandig naamwoord", meaning: "三本书, drie boeken." },
      { formula: "Aanwijzer + maatwoord + zelfstandig naamwoord", meaning: "这本书, dit boek." },
      { formula: "第 + getal", meaning: "Rangtelwoord: 第一, de eerste." },
    ],
    [
      { chinese: "两个人", pinyin: "liǎng ge rén", dutch: "twee personen" },
      { chinese: "三杯茶", pinyin: "sān bēi chá", dutch: "drie kopjes thee" },
      { chinese: "这张票", pinyin: "zhè zhāng piào", dutch: "dit ticket" },
    ],
    [
      "Leer een nieuw zelfstandig naamwoord samen met zijn maatwoord.",
      "Gebruik 两 vóór maatwoorden en 二 bij zuiver tellen.",
      "个 is een bruikbare noodoplossing, maar niet altijd de natuurlijke keuze.",
    ],
  ),
  article(
    "tijd",
    12,
    "Basis",
    "HSK 1-2",
    "Grammatica",
    "Tijd, datum en frequentie",
    "时间",
    "Chinese tijdsaanduidingen gaan van groot naar klein en staan meestal vóór het werkwoord.",
    9,
    [
      "Een datum wordt opgebouwd van jaar naar maand naar dag. Een kloktijd gaat van uur naar minuten. Dat grote-naar-kleine principe maakt veel vormen voorspelbaar.",
      "Een tijdsbepaling staat meestal na het onderwerp en vóór het werkwoord. Ze kan ook helemaal vooraan staan wanneer je de tijd als kader van de hele zin presenteert.",
      "Frequentiewoorden zoals 常常 vaak, 每天 elke dag en 有时候 soms komen eveneens vóór de hoofdhandeling.",
    ],
    [
      { formula: "jaar + 年 + maand + 月 + dag + 日/号", meaning: "2026年7月30日." },
      { formula: "Onderwerp + tijd + werkwoord", meaning: "我明天工作, ik werk morgen." },
      { formula: "每 + tijdseenheid + 都 + werkwoord", meaning: "Elke keer zonder uitzondering." },
    ],
    [
      { chinese: "今天是七月三十号。", pinyin: "Jīntiān shì qī yuè sānshí hào.", dutch: "Vandaag is het 30 juli." },
      { chinese: "我八点上班。", pinyin: "Wǒ bā diǎn shàngbān.", dutch: "Ik begin om acht uur te werken." },
      { chinese: "我每天都学中文。", pinyin: "Wǒ měitiān dōu xué Zhōngwén.", dutch: "Ik leer elke dag Chinees." },
    ],
    [
      "Denk van groot naar klein.",
      "Zet de tijd niet automatisch aan het einde zoals in het Nederlands.",
      "都 benadrukt dat elk genoemd geval meetelt.",
    ],
  ),
  article(
    "plaats-zai-you",
    13,
    "Basis",
    "HSK 1-2",
    "Grammatica",
    "Plaats met 在, 有 en locatievormen",
    "在 / 有",
    "在 zegt waar iets is of gebeurt. 有 zegt wat er op een bepaalde plaats aanwezig is.",
    9,
    [
      "Gebruik 在 zài wanneer een bekende persoon of zaak zich ergens bevindt. Gebruik 有 yǒu wanneer je vertrekt van een plaats en meldt wat daar aanwezig is.",
      "Woorden als 上 boven/op, 下 onder, 里 binnen en 前面 vooraan komen achter het referentiepunt: 桌子上, op de tafel.",
      "Bij een handeling staat 在 + plaats gewoonlijk vóór het werkwoord. Bij aankomen, gaan en enkele andere richtingswerkwoorden kan de bestemming anders worden opgebouwd.",
    ],
    [
      { formula: "Ding/persoon + 在 + plaats", meaning: "De kat is op de stoel." },
      { formula: "Plaats + 有 + ding/persoon", meaning: "Op de stoel zit een kat." },
      { formula: "Onderwerp + 在 + plaats + werkwoord", meaning: "Een handeling op een locatie." },
    ],
    [
      { chinese: "猫在椅子上。", pinyin: "Māo zài yǐzi shàng.", dutch: "De kat zit op de stoel." },
      { chinese: "椅子上有一只猫。", pinyin: "Yǐzi shàng yǒu yì zhī māo.", dutch: "Op de stoel zit een kat." },
      { chinese: "我在家吃饭。", pinyin: "Wǒ zài jiā chīfàn.", dutch: "Ik eet thuis." },
    ],
    [
      "在 vertrekt van het ding; 有 vertrekt van de plaats.",
      "Een locatievorm komt achter het referentiepunt.",
      "Zet 在 + plaats vóór de gewone handeling.",
    ],
  ),
  article(
    "modale-werkwoorden",
    14,
    "Basis",
    "HSK 2",
    "Grammatica",
    "Kunnen, mogen, willen en moeten",
    "能愿动词",
    "会, 能 en 可以 betekenen alle drie kunnen, maar vanuit kennis, mogelijkheid of toestemming.",
    10,
    [
      "会 huì gaat vaak over aangeleerde vaardigheid of verwachting. 能 néng gaat over feitelijke mogelijkheid en omstandigheden. 可以 kěyǐ gaat vaak over toestemming of aanvaardbaarheid.",
      "想 xiǎng drukt een wens of plan uit. 要 yào is sterker en kan willen, nodig hebben of moeten betekenen. 应该 yīnggāi betekent behoren te of zou moeten.",
      "Deze modale werkwoorden staan vóór het hoofdwerkwoord. In een kort antwoord kun je ze vaak zelfstandig herhalen.",
    ],
    [
      { formula: "Onderwerp + modaal werkwoord + hoofdwerkwoord", meaning: "我会说中文." },
      { formula: "可以 + werkwoord + 吗？", meaning: "Mag ik...?" },
      { formula: "想 + werkwoord", meaning: "Iets graag willen doen." },
    ],
    [
      { chinese: "我会说一点中文。", pinyin: "Wǒ huì shuō yìdiǎn Zhōngwén.", dutch: "Ik kan een beetje Chinees spreken." },
      { chinese: "今天我不能来。", pinyin: "Jīntiān wǒ bù néng lái.", dutch: "Vandaag kan ik niet komen." },
      { chinese: "这里可以拍照吗？", pinyin: "Zhèlǐ kěyǐ pāizhào ma?", dutch: "Mag je hier foto's nemen?" },
    ],
    [
      "会 is kunnen door geleerd vermogen.",
      "能 is kunnen door de concrete omstandigheden.",
      "可以 is kunnen of mogen omdat het toegestaan of aanvaardbaar is.",
    ],
  ),
  article(
    "le",
    15,
    "Verdieping",
    "HSK 2-3",
    "Grammatica",
    "De twee functies van 了",
    "了",
    "了 markeert geen gewone verleden tijd. Het toont voltooiing of een nieuwe toestand.",
    12,
    [
      "Direct na een werkwoord kan 了 aangeven dat een afgebakende handeling voltooid is. Het gaat om de begrenzing van de gebeurtenis, niet simpelweg om verleden tijd.",
      "Aan het einde van een zin kan 了 aangeven dat de situatie nu veranderd is of dat nieuwe informatie relevant geworden is. 下雨了 betekent dat het nu begonnen is te regenen.",
      "De twee functies kunnen in één zin samen voorkomen. Een tijdsaanduiding alleen kan al duidelijk maken dat iets in het verleden gebeurde, zonder dat 了 verplicht is.",
    ],
    [
      { formula: "Werkwoord + 了 + afgebakend voorwerp", meaning: "Een voltooide gebeurtenis." },
      { formula: "Nieuwe toestand + 了", meaning: "Nu is de situatie anders." },
      { formula: "没 + werkwoord", meaning: "Ontkenning van voltooiing, meestal zonder 了." },
    ],
    [
      { chinese: "我买了一本书。", pinyin: "Wǒ mǎi le yì běn shū.", dutch: "Ik heb een boek gekocht." },
      { chinese: "下雨了。", pinyin: "Xiàyǔ le.", dutch: "Het is beginnen te regenen." },
      { chinese: "我没买书。", pinyin: "Wǒ méi mǎi shū.", dutch: "Ik heb geen boek gekocht." },
    ],
    [
      "Vertaal 了 niet automatisch als verleden tijd.",
      "Vraag je af: is de handeling begrensd, of is de toestand veranderd?",
      "Na 没 verdwijnt de voltooide 了 gewoonlijk.",
    ],
  ),
  article(
    "zai-zhe",
    16,
    "Verdieping",
    "HSK 2-3",
    "Grammatica",
    "Een lopende handeling met 在 en 着",
    "在 / 着",
    "在 benadrukt een activiteit die bezig is. 着 beschrijft vaak een voortdurende toestand.",
    9,
    [
      "在 zài vóór een werkwoord toont dat een handeling op dat moment bezig is. 正在 zhèngzài legt er nog meer nadruk op. 呢 aan het einde kan het lopende karakter versterken.",
      "着 zhe staat achter een werkwoord en beschrijft vaak de toestand die door die handeling blijft bestaan: een deur staat open, iemand draagt een jas.",
      "Vergelijk 看, kijken; 在看, aan het kijken zijn; en 放着, neergelegd staan of liggen.",
    ],
    [
      { formula: "(正)在 + werkwoord + 呢", meaning: "Nu bezig zijn met een activiteit." },
      { formula: "Werkwoord + 着", meaning: "Een aanhoudende toestand." },
    ],
    [
      { chinese: "我在看书呢。", pinyin: "Wǒ zài kàn shū ne.", dutch: "Ik ben een boek aan het lezen." },
      { chinese: "门开着。", pinyin: "Mén kāi zhe.", dutch: "De deur staat open." },
      { chinese: "她穿着红衣服。", pinyin: "Tā chuān zhe hóng yīfu.", dutch: "Zij draagt rode kleren." },
    ],
    [
      "在 staat vóór de activiteit.",
      "着 staat achter het werkwoord dat de voortdurende toestand veroorzaakt.",
      "Niet elk Nederlands 'aan het' hoeft expliciet gemarkeerd te worden.",
    ],
  ),
  article(
    "guo",
    17,
    "Verdieping",
    "HSK 3",
    "Grammatica",
    "Ervaring uitdrukken met 过",
    "过",
    "过 zegt dat je iets ooit hebt meegemaakt, zonder die ene gebeurtenis centraal te stellen.",
    8,
    [
      "过 guo staat na het werkwoord en markeert levenservaring: je hebt iets minstens één keer gedaan of meegemaakt.",
      "De vraag gaat niet om wanneer de gebeurtenis precies plaatsvond. Zodra je een specifieke, afgeronde gebeurtenis vertelt, is 了 vaak geschikter.",
      "De ontkenning is 没(有) + werkwoord + 过. Een vaak gebruikte vraag is 你...过吗？",
    ],
    [
      { formula: "Werkwoord + 过", meaning: "Iets ooit hebben ervaren." },
      { formula: "没(有) + werkwoord + 过", meaning: "Iets nog nooit hebben ervaren." },
    ],
    [
      { chinese: "我去过中国。", pinyin: "Wǒ qù guo Zhōngguó.", dutch: "Ik ben ooit in China geweest." },
      { chinese: "你吃过这个吗？", pinyin: "Nǐ chī guo zhège ma?", dutch: "Heb je dit al eens gegeten?" },
      { chinese: "我没看过这部电影。", pinyin: "Wǒ méi kàn guo zhè bù diànyǐng.", dutch: "Ik heb deze film nog nooit gezien." },
    ],
    [
      "过 gaat over ervaring, niet over één specifiek afgerond moment.",
      "Gebruik 没...过 voor nog nooit.",
      "Een exacte tijd en 过 passen niet altijd natuurlijk bij elkaar.",
    ],
  ),
  article(
    "vergelijken",
    18,
    "Verdieping",
    "HSK 2-3",
    "Grammatica",
    "Vergelijken met 比, 没有 en 一样",
    "比较",
    "Chinese vergelijkingen zetten eerst wat je beoordeelt, dan de norm, en daarna het verschil.",
    10,
    [
      "Met 比 bǐ zeg je dat A een bepaalde eigenschap sterker heeft dan B. De eigenschap komt achter de twee vergelijkingsdelen.",
      "Voor 'A is niet zo ... als B' gebruik je vaak A 没有 B + eigenschap. 一样 drukt gelijkheid uit en kan gevolgd worden door een eigenschap.",
      "Veel en weinig verschil voeg je achter de eigenschap toe met 得多, 多了 of 一点儿. Gebruik normaal geen 很 direct vóór de eigenschap in een 比-zin.",
    ],
    [
      { formula: "A + 比 + B + eigenschap", meaning: "A is ...er dan B." },
      { formula: "A + 没有 + B + eigenschap", meaning: "A is niet zo ... als B." },
      { formula: "A + 跟 + B + 一样 + eigenschap", meaning: "A is even ... als B." },
    ],
    [
      { chinese: "今天比昨天热。", pinyin: "Jīntiān bǐ zuótiān rè.", dutch: "Vandaag is het warmer dan gisteren." },
      { chinese: "我没有他高。", pinyin: "Wǒ méiyǒu tā gāo.", dutch: "Ik ben niet zo groot als hij." },
      { chinese: "这两个一样好。", pinyin: "Zhè liǎng ge yíyàng hǎo.", dutch: "Deze twee zijn even goed." },
    ],
    [
      "Zet 很 niet automatisch in een 比-vergelijking.",
      "Het verschil komt achter de eigenschap.",
      "Gebruik 没有, niet 不比, voor de neutrale betekenis 'niet zo ... als'.",
    ],
  ),
  article(
    "resultaatcomplementen",
    19,
    "Verdieping",
    "HSK 3",
    "Grammatica",
    "Resultaatcomplementen",
    "结果补语",
    "Een tweede element achter het werkwoord vertelt wat de handeling uiteindelijk opleverde.",
    11,
    [
      "In 看懂 betekent 看 kijken of lezen en 懂 begrijpen. Samen betekent het: door te kijken of lezen tot begrip komen. Het resultaat is een essentieel onderdeel van de gebeurtenis.",
      "Veelgebruikte resultaten zijn 完 afmaken, 到 bereiken of vinden, 见 waarnemen, 懂 begrijpen, 好 succesvol of klaar en 错 fout.",
      "De mogelijkheid om het resultaat te bereiken druk je vaak uit met 得 of 不 tussen werkwoord en resultaat: 看得懂, kunnen begrijpen; 看不懂, niet kunnen begrijpen.",
    ],
    [
      { formula: "Werkwoord + resultaat", meaning: "De handeling bereikt een bepaald resultaat." },
      { formula: "Werkwoord + 得 + resultaat", meaning: "Het resultaat is haalbaar." },
      { formula: "Werkwoord + 不 + resultaat", meaning: "Het resultaat is niet haalbaar." },
    ],
    [
      { chinese: "我看完了。", pinyin: "Wǒ kànwán le.", dutch: "Ik heb het uitgelezen of uitgekeken." },
      { chinese: "你听懂了吗？", pinyin: "Nǐ tīngdǒng le ma?", dutch: "Heb je het verstaan?" },
      { chinese: "这个字我看不懂。", pinyin: "Zhège zì wǒ kàn bu dǒng.", dutch: "Ik kan dit karakter niet begrijpen." },
    ],
    [
      "Leer veelvoorkomende werkwoord-resultaatcombinaties als één geheel.",
      "Een activiteit en het bereikte resultaat zijn niet hetzelfde.",
      "得 en 不 maken van het resultaat een haalbaarheidsvraag.",
    ],
  ),
  article(
    "richtingcomplementen",
    20,
    "Verdieping",
    "HSK 3-4",
    "Grammatica",
    "Richting: 来, 去 en samengestelde vormen",
    "趋向补语",
    "Richtingscomplementen tonen beweging naar of weg van het gekozen gezichtspunt.",
    11,
    [
      "来 lái beschrijft beweging naar de spreker of het gekozen referentiepunt. 去 qù beschrijft beweging ervan weg. Ze komen achter een bewegingswerkwoord.",
      "Elementen als 上 omhoog, 下 omlaag, 进 naar binnen, 出 naar buiten, 回 terug en 过 over worden met 来 of 去 gecombineerd.",
      "De keuze is ruimtelijk én perspectivisch. In een telefoongesprek kan iemand zeggen 我马上过来, ik kom meteen naar jou toe, ook al is de spreker fysiek elders.",
    ],
    [
      { formula: "Werkwoord + 来 / 去", meaning: "Naar hier of van hier weg." },
      { formula: "Werkwoord + richting + 来 / 去", meaning: "Samengestelde richting, zoals 走进去." },
    ],
    [
      { chinese: "请进来。", pinyin: "Qǐng jìnlái.", dutch: "Kom alsjeblieft binnen." },
      { chinese: "他跑出去了。", pinyin: "Tā pǎo chūqu le.", dutch: "Hij is naar buiten gerend." },
      { chinese: "我马上回来。", pinyin: "Wǒ mǎshàng huílái.", dutch: "Ik kom meteen terug." },
    ],
    [
      "Bepaal eerst het gezichtspunt.",
      "来 beweegt naar dat punt; 去 beweegt ervan weg.",
      "Lees lange combinaties van links naar rechts: handeling, richting, perspectief.",
    ],
  ),
  article(
    "de-complement",
    21,
    "Verdieping",
    "HSK 3",
    "Grammatica",
    "Hoe iets gebeurt met 得",
    "得",
    "得 verbindt een handeling met een beoordeling van de manier, kwaliteit of graad.",
    9,
    [
      "Met 得 de beschrijf je hoe goed, snel of zorgvuldig een handeling wordt uitgevoerd. Het staat na het werkwoord en vóór de beoordeling.",
      "Wanneer het werkwoord een voorwerp heeft, wordt het werkwoord vaak herhaald: 他说中文说得很好. In alledaagse korte zinnen kan de structuur compacter zijn.",
      "Verwar 得 niet met 的, dat een zelfstandig naamwoord beschrijft, of 地, dat een manier vóór het werkwoord zet.",
    ],
    [
      { formula: "Werkwoord + 得 + beschrijving", meaning: "Hoe de handeling verloopt." },
      { formula: "Werkwoord + voorwerp + werkwoord + 得 + beschrijving", meaning: "Volledige vorm met een voorwerp." },
    ],
    [
      { chinese: "他说得很快。", pinyin: "Tā shuō de hěn kuài.", dutch: "Hij spreekt snel." },
      { chinese: "她中文说得很好。", pinyin: "Tā Zhōngwén shuō de hěn hǎo.", dutch: "Zij spreekt heel goed Chinees." },
      { chinese: "你写得很清楚。", pinyin: "Nǐ xiě de hěn qīngchu.", dutch: "Je schrijft heel duidelijk." },
    ],
    [
      "得 staat na het beoordeelde werkwoord.",
      "Bij een voorwerp zie je het werkwoord vaak tweemaal.",
      "的 beschrijft een naamwoord, 地 staat vóór een handeling, 得 staat erna.",
    ],
  ),
  article(
    "relatieve-zinnen",
    22,
    "Verdieping",
    "HSK 3-4",
    "Grammatica",
    "Lange beschrijvingen vóór het naamwoord",
    "定语",
    "Een volledige beschrijving komt in het Chinees vóór het woord dat ze beschrijft.",
    11,
    [
      "Waar het Nederlands zegt 'de man die daar staat', zegt het Chinees letterlijk 'daar staande DE man'. De hele betrekkelijke bijzin komt vóór het zelfstandig naamwoord.",
      "的 markeert de grens tussen de beschrijving en het kernwoord. Begin bij het begrijpen vaak achteraan: identificeer eerst het kernwoord en lees daarna terug wat ervoor staat.",
      "Ook complexe relaties werken zo. De woordvolgorde binnen de beschrijving blijft verder een gewone Chinese zinsvolgorde.",
    ],
    [
      { formula: "[beschrijving] + 的 + zelfstandig naamwoord", meaning: "Het naamwoord dat door de voorafgaande zin wordt bepaald." },
      { formula: "[onderwerp + werkwoord + voorwerp] + 的 + naamwoord", meaning: "Een volledige relatieve bijzin." },
    ],
    [
      { chinese: "站在那边的人", pinyin: "zhàn zài nàbiān de rén", dutch: "de persoon die daar staat" },
      { chinese: "我昨天买的书", pinyin: "wǒ zuótiān mǎi de shū", dutch: "het boek dat ik gisteren kocht" },
      { chinese: "你给我的礼物很好看。", pinyin: "Nǐ gěi wǒ de lǐwù hěn hǎokàn.", dutch: "Het cadeau dat je mij gaf is mooi." },
    ],
    [
      "Zoek bij het lezen eerst het kernwoord na 的.",
      "Zet de volledige beschrijving vóór dat kernwoord.",
      "Maak lange structuren stap voor stap langer.",
    ],
  ),
  article(
    "ba",
    23,
    "Verdieping",
    "HSK 3-4",
    "Grammatica",
    "Het voorwerp naar voren met 把",
    "把字句",
    "Een 把-zin zet een bekend voorwerp vóór het werkwoord en benadrukt wat ermee gebeurt.",
    12,
    [
      "In de gewone volgorde staat het voorwerp na het werkwoord. Met 把 bǎ haal je een specifiek of bekend voorwerp naar voren wanneer de handeling het duidelijk verandert, verplaatst of afhandelt.",
      "Na het werkwoord moet meestal voldoende informatie volgen, bijvoorbeeld een resultaat, richting, plaats, hoeveelheid of 了. Een kale vorm als 我把书看 klinkt onvolledig.",
      "De ontkenning of het modale werkwoord staat vóór 把.",
    ],
    [
      { formula: "Onderwerp + 把 + bekend voorwerp + werkwoord + resultaat", meaning: "Wat gebeurt er met het voorwerp?" },
      { formula: "Onderwerp + 不/没/要 + 把 + voorwerp + ...", meaning: "Ontkenning en modaliteit staan vóór 把." },
    ],
    [
      { chinese: "请把门关上。", pinyin: "Qǐng bǎ mén guānshang.", dutch: "Doe de deur alsjeblieft dicht." },
      { chinese: "我把书看完了。", pinyin: "Wǒ bǎ shū kànwán le.", dutch: "Ik heb het boek uitgelezen." },
      { chinese: "别把手机放在这里。", pinyin: "Bié bǎ shǒujī fàng zài zhèlǐ.", dutch: "Leg je gsm niet hier." },
    ],
    [
      "Gebruik 把 vooral bij een bekend en beïnvloed voorwerp.",
      "Laat na het werkwoord zien wat het resultaat of de nieuwe toestand is.",
      "Niet elke zin met een voorwerp wordt natuurlijker met 把.",
    ],
  ),
  article(
    "bei",
    24,
    "Verdieping",
    "HSK 3-4",
    "Grammatica",
    "De lijdende vorm met 被",
    "被字句",
    "Met 被 maak je het ondergane resultaat belangrijker dan de uitvoerder.",
    10,
    [
      "被 bèi markeert een passieve constructie. Het onderwerp ondergaat de handeling. De uitvoerder kan genoemd of weggelaten worden.",
      "Passieve zinnen komen in het Chinees minder vaak voor dan in formeel Nederlands. Gebruik ze wanneer het ondergane resultaat werkelijk centraal staat.",
      "被 had vroeger vaak een negatieve bijklank, maar in modern Chinees kan de constructie ook neutraal zijn.",
    ],
    [
      { formula: "Ondergaand onderwerp + 被 + uitvoerder + werkwoord + resultaat", meaning: "De uitvoerder doet iets met het onderwerp." },
      { formula: "Ondergaand onderwerp + 被 + werkwoord", meaning: "De uitvoerder blijft onbekend of onbelangrijk." },
    ],
    [
      { chinese: "我的自行车被人偷了。", pinyin: "Wǒ de zìxíngchē bèi rén tōu le.", dutch: "Mijn fiets is door iemand gestolen." },
      { chinese: "窗户被风吹开了。", pinyin: "Chuānghu bèi fēng chuī kāi le.", dutch: "Het raam is door de wind opengeblazen." },
      { chinese: "问题已经被解决了。", pinyin: "Wèntí yǐjīng bèi jiějué le.", dutch: "Het probleem is al opgelost." },
    ],
    [
      "Het onderwerp ondergaat de handeling.",
      "Noem de uitvoerder alleen wanneer die relevant is.",
      "Een actieve Chinese zin is vaak natuurlijker wanneer het resultaat niet centraal staat.",
    ],
  ),
  article(
    "shi-de",
    25,
    "Verdieping",
    "HSK 3-4",
    "Grammatica",
    "Details benadrukken met 是…的",
    "是…的",
    "Deze constructie benadrukt wie, waar, wanneer of hoe een bekende gebeurtenis plaatsvond.",
    10,
    [
      "是…的 wordt gebruikt wanneer de gebeurtenis als bekend of voltooid wordt verondersteld en je één detail ervan in de kijker zet.",
      "是 staat vóór het benadrukte onderdeel. 的 staat gewoonlijk aan het einde of vóór het voorwerp. In informele taal kan 是 soms wegvallen.",
      "Gebruik de constructie niet voor een gewone toekomstige handeling of wanneer je vooral meldt dát iets gebeurd is.",
    ],
    [
      { formula: "Onderwerp + 是 + benadrukt detail + werkwoord + 的", meaning: "Het was precies op die manier, plaats of tijd." },
    ],
    [
      { chinese: "我是昨天来的。", pinyin: "Wǒ shì zuótiān lái de.", dutch: "Ik ben gisteren gekomen, niet op een andere dag." },
      { chinese: "你是在哪儿学的中文？", pinyin: "Nǐ shì zài nǎr xué de Zhōngwén?", dutch: "Waar heb je Chinees geleerd?" },
      { chinese: "这张照片是他拍的。", pinyin: "Zhè zhāng zhàopiàn shì tā pāi de.", dutch: "Deze foto is door hem genomen." },
    ],
    [
      "De gebeurtenis zelf is al bekend.",
      "Zet 是 vóór het detail waarop je contrasteert.",
      "Verwar deze focusconstructie niet met een gewone 是-zin.",
    ],
  ),
  article(
    "verbanden",
    26,
    "Verdieping",
    "HSK 3-4",
    "Grammatica",
    "Omdat, hoewel, als en daarom",
    "复句",
    "Chinese verbandwoorden komen vaak in vaste paren die de relatie tussen twee zinsdelen zichtbaar maken.",
    12,
    [
      "Waar het Nederlands soms één voegwoord gebruikt, gebruikt het Chinees graag een paar: omdat... daarom, hoewel... toch, als... dan.",
      "Het tweede deel kan in eenvoudige gesprekken soms zonder het eerste markeringswoord voorkomen. Als leerder is het veiliger om eerst de volledige patronen te beheersen.",
      "Omdat de woordvolgorde binnen elk deel normaal blijft, kun je complexe zinnen opbouwen door twee correcte korte zinnen met het juiste paar te verbinden.",
    ],
    [
      { formula: "因为…所以…", meaning: "Omdat... daarom..." },
      { formula: "虽然…但是…", meaning: "Hoewel... toch..." },
      { formula: "如果…就…", meaning: "Als... dan..." },
      { formula: "不但…而且…", meaning: "Niet alleen... maar ook..." },
    ],
    [
      { chinese: "因为下雨，所以我没去。", pinyin: "Yīnwèi xiàyǔ, suǒyǐ wǒ méi qù.", dutch: "Omdat het regende, ben ik niet gegaan." },
      { chinese: "虽然很难，但是很有意思。", pinyin: "Suīrán hěn nán, dànshì hěn yǒuyìsi.", dutch: "Hoewel het moeilijk is, is het interessant." },
      { chinese: "如果你有时间，我们就一起去。", pinyin: "Rúguǒ nǐ yǒu shíjiān, wǒmen jiù yìqǐ qù.", dutch: "Als je tijd hebt, gaan we samen." },
    ],
    [
      "Leer de twee helften als paar.",
      "就 kan een logisch of snel gevolg aangeven.",
      "Maak elk zinsdeel eerst afzonderlijk correct.",
    ],
  ),
  article(
    "topic-comment",
    27,
    "Gevorderd",
    "HSK 4+",
    "Grammatica",
    "Denken in onderwerp en commentaar",
    "话题－说明",
    "Chinees zet vaak eerst het gespreksonderwerp neer en zegt daarna iets over dat kader.",
    11,
    [
      "Niet elke Chinese zin volgt alleen de grammaticale relatie onderwerp-werkwoord. Een bekend onderwerp van gesprek kan vooraan staan, gevolgd door een volledige mededeling die er commentaar op geeft.",
      "Dat verklaart zinnen waarin het voorwerp ogenschijnlijk tweemaal voorkomt of naar voren is gehaald. De voorste positie organiseert de informatie, niet noodzakelijk de grammaticale rol.",
      "Topic-commentstructuren zijn bijzonder gewoon in gesproken Chinees. Ze helpen om eerst het kader te activeren en daarna nieuwe informatie toe te voegen.",
    ],
    [
      { formula: "Topic + commentaarzin", meaning: "Wat dit onderwerp betreft, geldt het volgende." },
      { formula: "Tijd/plaats/zaak + volledige zin", meaning: "Een kader voor de mededeling." },
    ],
    [
      { chinese: "这本书，我已经看完了。", pinyin: "Zhè běn shū, wǒ yǐjīng kànwán le.", dutch: "Dit boek, dat heb ik al uitgelezen." },
      { chinese: "中文，我觉得语法不太难。", pinyin: "Zhōngwén, wǒ juéde yǔfǎ bú tài nán.", dutch: "Wat Chinees betreft, vind ik de grammatica niet zo moeilijk." },
      { chinese: "今天，我们先休息。", pinyin: "Jīntiān, wǒmen xiān xiūxi.", dutch: "Vandaag rusten we eerst." },
    ],
    [
      "Het topic is waarover je praat; het grammaticale onderwerp is wie of wat de handeling draagt.",
      "Een korte spreekpauze na het topic is natuurlijk.",
      "Gebruik de vorm om bekende informatie eerst te zetten.",
    ],
  ),
  article(
    "lian-dou",
    28,
    "Gevorderd",
    "HSK 4+",
    "Grammatica",
    "Nadruk met 连…都/也",
    "连…都/也",
    "Met 连 zet je een extreem of onverwacht geval voorop: zelfs dat geldt.",
    8,
    [
      "连 lián introduceert het meest onverwachte voorbeeld binnen een schaal. 都 dōu of 也 yě laat zien dat zelfs dit geval onder de uitspraak valt.",
      "De constructie kan een zelfstandig naamwoord, hoeveelheid of handeling benadrukken. De context bepaalt welke alternatieven impliciet worden vergeleken.",
      "Bij ontkenning betekent het vaak zelfs niet één of zelfs nooit.",
    ],
    [
      { formula: "连 + extreem geval + 都/也 + uitspraak", meaning: "Zelfs dit onverwachte geval..." },
    ],
    [
      { chinese: "他连自己的名字都写错了。", pinyin: "Tā lián zìjǐ de míngzi dōu xiěcuò le.", dutch: "Hij schreef zelfs zijn eigen naam verkeerd." },
      { chinese: "我连一次也没去过。", pinyin: "Wǒ lián yí cì yě méi qù guo.", dutch: "Ik ben er zelfs nog geen enkele keer geweest." },
      { chinese: "这么简单，连孩子都懂。", pinyin: "Zhème jiǎndān, lián háizi dōu dǒng.", dutch: "Het is zo eenvoudig dat zelfs kinderen het begrijpen." },
    ],
    [
      "连 markeert het onverwachte uiterste.",
      "都 en 也 sluiten de schaal in.",
      "Bij ontkenning staat 没 of 不 later in het gezegde.",
    ],
  ),
  article(
    "kennismaken",
    29,
    "Basis",
    "HSK 1",
    "Praktijk",
    "Jezelf voorstellen",
    "自我介绍",
    "Combineer naam, herkomst, beroep en talen tot een natuurlijk eerste gesprek.",
    10,
    [
      "Een Chinese naam wordt meestal met 我叫, ik heet, geïntroduceerd. Voor nationaliteit of beroep gebruik je 是. Om te zeggen waar je woont, gebruik je 住在.",
      "Begin met korte zinnen. Voeg daarna een wederkerige vraag toe met 你呢 of een gerichte vraag met 什么, 哪国 of 做什么工作.",
      "你好吗 is grammaticaal, maar in echte eerste ontmoetingen zijn 你好 en concrete vragen vaak natuurlijker.",
    ],
    [
      { formula: "我叫 + naam", meaning: "Ik heet..." },
      { formula: "我是 + nationaliteit/beroep", meaning: "Ik ben..." },
      { formula: "我住在 + plaats", meaning: "Ik woon in..." },
    ],
    [
      { chinese: "你好，我叫德里。", pinyin: "Nǐ hǎo, wǒ jiào Délǐ.", dutch: "Hallo, ik heet Derry." },
      { chinese: "我是比利时人，住在布鲁塞尔附近。", pinyin: "Wǒ shì Bǐlìshí rén, zhù zài Bùlǔsài'ěr fùjìn.", dutch: "Ik ben Belg en woon in de buurt van Brussel." },
      { chinese: "我在学中文。你呢？", pinyin: "Wǒ zài xué Zhōngwén. Nǐ ne?", dutch: "Ik leer Chinees. En jij?" },
    ],
    [
      "Gebruik 叫 voor je naam en 是 voor identiteit.",
      "Stel één concrete wedervraag.",
      "Oefen je introductie als een vast blok, maar pas details flexibel aan.",
    ],
  ),
  article(
    "restaurant",
    30,
    "Basis",
    "HSK 1-2",
    "Praktijk",
    "Bestellen in een restaurant",
    "在饭馆",
    "Leer beleefd bestellen, hoeveelheden aangeven, voorkeuren uitspreken en de rekening vragen.",
    12,
    [
      "Met 我要 kun je direct bestellen. 我想要 klinkt iets zachter. Voeg getal en maatwoord toe, bijvoorbeeld 一杯茶 of 两碗米饭.",
      "Geen of minder van een ingrediënt vraag je met 不要 of 少放. Een voorkeur klinkt minder absoluut met 我比较喜欢, ik heb liever.",
      "服务员 is de algemene term voor bedienend personeel, maar oogcontact en 请问 zijn vaak een natuurlijkere start dan luid roepen.",
    ],
    [
      { formula: "我要 + hoeveelheid + gerecht", meaning: "Ik neem..." },
      { formula: "请 + handeling", meaning: "Alstublieft..." },
      { formula: "不要 / 少放 + ingrediënt", meaning: "Zonder / met minder..." },
    ],
    [
      { chinese: "我要一杯茶和两碗米饭。", pinyin: "Wǒ yào yì bēi chá hé liǎng wǎn mǐfàn.", dutch: "Ik neem een kop thee en twee kommen rijst." },
      { chinese: "请少放一点辣椒。", pinyin: "Qǐng shǎo fàng yìdiǎn làjiāo.", dutch: "Doe er alstublieft wat minder chili in." },
      { chinese: "请问，可以买单吗？", pinyin: "Qǐngwèn, kěyǐ mǎidān ma?", dutch: "Pardon, mag ik afrekenen?" },
    ],
    [
      "Gebruik 两 vóór een maatwoord.",
      "请问 opent een beleefde vraag.",
      "不要 betekent nadrukkelijk niet willen; 少放 vraagt om minder.",
    ],
  ),
  article(
    "winkelen",
    31,
    "Basis",
    "HSK 1-2",
    "Praktijk",
    "Winkelen en prijzen",
    "买东西",
    "Vraag naar prijs, maat, kleur en beschikbaarheid zonder Nederlandse zinsbouw te kopiëren.",
    11,
    [
      "De prijs vraag je met 多少钱, hoeveel geld. Het vraagwoord staat waar het antwoord zou komen: 这个多少钱？",
      "Met 有没有 vraag je of iets beschikbaar is. Een eigenschap of variant komt vóór het zelfstandig naamwoord, vaak met 的 wanneer de beschrijving langer is.",
      "太...了 drukt een sterke beoordeling uit. 能便宜一点吗 vraagt letterlijk of het een beetje goedkoper kan.",
    ],
    [
      { formula: "Dit + 多少钱？", meaning: "Hoeveel kost dit?" },
      { formula: "有没有 + variant/voorwerp？", meaning: "Hebben jullie...?" },
      { formula: "能 + eigenschap + 一点吗？", meaning: "Kan het een beetje ...er?" },
    ],
    [
      { chinese: "这个多少钱？", pinyin: "Zhège duōshao qián?", dutch: "Hoeveel kost dit?" },
      { chinese: "有没有大一点的？", pinyin: "Yǒu méiyǒu dà yìdiǎn de?", dutch: "Hebt u een iets grotere?" },
      { chinese: "太贵了，能便宜一点吗？", pinyin: "Tài guì le, néng piányi yìdiǎn ma?", dutch: "Het is te duur. Kan het wat goedkoper?" },
    ],
    [
      "Laat het vraagwoord op de antwoordplek staan.",
      "一点 na de eigenschap betekent een beetje meer in die richting.",
      "的 kan het reeds bekende product vervangen.",
    ],
  ),
  article(
    "richting-vragen",
    32,
    "Basis",
    "HSK 2",
    "Praktijk",
    "De weg vragen en vervoer nemen",
    "问路",
    "Gebruik 在哪儿 voor locatie, 怎么走 voor de route en 离 voor afstand.",
    12,
    [
      "Vraag waar een plaats is met 在哪儿. Vraag hoe je erheen gaat met 怎么走 of 怎么去. Het verschil is locatie tegenover route.",
      "Afstand wordt uitgedrukt met A 离 B + ver of dichtbij. Voor vervoer gebruik je vaak 坐 + vervoermiddel, te voet is 走路.",
      "Richtingen worden gecombineerd met 往, naar, en locatievormen zoals 前, 后, 左 en 右.",
    ],
    [
      { formula: "Plaats + 在哪儿？", meaning: "Waar is de plaats?" },
      { formula: "去 + plaats + 怎么走？", meaning: "Hoe geraak ik bij die plaats?" },
      { formula: "A + 离 + B + 远/近", meaning: "A ligt ver van of dicht bij B." },
    ],
    [
      { chinese: "请问，地铁站在哪儿？", pinyin: "Qǐngwèn, dìtiě zhàn zài nǎr?", dutch: "Pardon, waar is het metrostation?" },
      { chinese: "去火车站怎么走？", pinyin: "Qù huǒchēzhàn zěnme zǒu?", dutch: "Hoe geraak ik bij het treinstation?" },
      { chinese: "酒店离这里远吗？", pinyin: "Jiǔdiàn lí zhèlǐ yuǎn ma?", dutch: "Ligt het hotel ver van hier?" },
    ],
    [
      "在哪儿 vraagt naar de plaats; 怎么走 vraagt naar de route.",
      "坐 staat vóór het vervoermiddel.",
      "离 beschrijft de afstand tussen twee punten.",
    ],
  ),
];

export const articles: Article[] = [...coreArticles, ...extendedArticles].map(enrichArticle);

export const articleLevels: ArticleLevel[] = ["Start", "Basis", "Verdieping", "Gevorderd"];
export const articleKinds: ArticleKind[] = ["Uitspraak", "Schrift", "Grammatica", "Praktijk"];

export const articleSources = [
  {
    label: "Officiële HSK-testsyllabus",
    url: "https://www.chinesetest.cn/hsk",
    detail: "Ordening van niveaus, vaardigheden, thema’s en grammaticale leerdoelen.",
  },
  {
    label: "MIT OpenCourseWare · Learning Chinese",
    url: "https://ocw.mit.edu/courses/res-21g-003-learning-chinese-a-foundation-course-in-mandarin-spring-2011/",
    detail: "Open cursusmateriaal over uitspraak, schrift en Chinees van beginner tot middenniveau.",
  },
  {
    label: "Chinese Grammar Wiki",
    url: "https://resources.allsetlearning.com/chinese/grammar/Main_Page",
    detail: "Open naslagwerk voor de selectie en controle van grammaticale onderwerpen.",
  },
];
