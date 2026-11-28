import type { Article } from "./articles";
import { exampleAnalyses } from "./exampleAnalyses";

type Enrichment = [depth: string, pitfall: string, practice: string];

const enrichment: Record<string, Enrichment> = {
  "karakters-lezen": [
    "Ongeveer tachtig procent van de moderne karakters is semantisch-fonetisch opgebouwd: één component suggereert een betekenisveld en een andere de historische klank. De aanwijzing is nuttig, maar door eeuwen taalverandering nooit volledig betrouwbaar.",
    "Verwar een component niet automatisch met de actuele betekenis van het hele karakter. 妈 bevat 马 als klankdrager, maar heeft inhoudelijk niets met een paard te maken.",
    "Neem een onbekend karakter, markeer de vermoedelijke betekeniscomponent en klankcomponent en controleer daarna pas uitspraak en betekenis.",
  ],
  pinyin: [
    "Pinyin beschrijft Mandarijnklanken en is geen fonetische spelling volgens Nederlandse regels. Initialen, finalen en tonen vormen samen één lettergreep; dezelfde letter kan bovendien anders klinken afhankelijk van de finale.",
    "Lees q, x, c en r niet met hun Nederlandse waarde. Een goed geschreven pinyinwoord kan toch onbegrijpelijk klinken wanneer de tongpositie verkeerd is.",
    "Luister naar één lettergreep, pauzeer, imiteer haar drie keer en vergelijk vervolgens je opname met het origineel.",
  ],
  tonen: [
    "Tonen worden relatief aan je eigen stembereik uitgesproken. Belangrijker dan absolute toonhoogte is de contour: vlak, stijgend, laag of dalend. In een zin worden contouren kleiner, maar het contrast blijft hoorbaar.",
    "Maak de derde toon niet altijd tot een theatrale daling en stijging. Voor een andere lettergreep blijft hij meestal laag; de volledige stijging hoor je vooral geïsoleerd of aan het einde.",
    "Oefen elk nieuw woord eerst langzaam, daarna in een toonpaar en ten slotte in een volledige zin zonder het ritme te verliezen.",
  ],
  toonveranderingen: [
    "Toonverandering is grotendeels fonetisch en verandert de woordenboekvorm niet. Bij een reeks derde tonen hangt de groepering samen met woord- en zinsgrenzen, waardoor langere reeksen niet simpelweg mechanisch afwisselen.",
    "Schrijf in gewone pinyin nǐ hǎo; ní hǎo kan de veranderde uitspraak illustreren: bij twee derde tonen blijft de geschreven vorm nǐ hǎo. Pas de regel voor 一 ook niet toe bij tellen of rangtelwoorden: 第一 blijft dì-yī.",
    "Markeer in een korte zin eerst alle woordenboektonen en spreek haar daarna opnieuw uit met de toepasselijke toonveranderingen.",
  ],
  basiszinsvolgorde: [
    "Chinese woordvolgorde organiseert informatie van context naar kernhandeling. Tijd en plaats staan daarom vaak vroeg, terwijl resultaat, richting en hoeveelheid na het werkwoord kunnen komen. Het is een informatiestructuur, geen star invulschema.",
    "Plaats een tijdsbepaling niet automatisch aan het einde omdat dat in het Nederlands natuurlijk klinkt. Bij neutrale zinnen staat ze meestal vóór de handeling.",
    "Bouw vijf zinnen telkens in lagen: onderwerp, tijd, plaats, manier en pas daarna werkwoord plus voorwerp.",
  ],
  shi: [
    "是 koppelt vooral twee nominale eenheden of benadrukt een identificatie. Het Nederlands gebruikt zijn veel ruimer voor toestand, plaats en bestaan; het Chinees kiest daarvoor adjectieven, 在, 有 of andere werkwoorden.",
    "Zeg niet 他是很忙 voor ‘hij heeft het druk’. 很 is hier de normale koppeling tussen onderwerp en eigenschap, zonder noodzakelijk heel te betekenen.",
    "Vertaal vijf zinnen met zijn en beslis vóór het vertalen of ze identiteit, eigenschap, locatie of bestaan uitdrukken.",
  ],
  "hen-adjectieven": [
    "Een Chinees adjectief kan zelf als gezegde functioneren. 很 maakt een neutrale uitspraak mogelijk en voorkomt dat een kaal adjectief gemakkelijk als contrast klinkt. De precieze sterkte hangt dus sterk van context en klemtoon af.",
    "Vertaal 很 niet altijd letterlijk als heel. In 他很好 kan het vooral de grammaticaal neutrale verbinding vormen; in 他非常好 is de hoge graad wel expliciet.",
    "Maak met één adjectief een neutrale zin, een echte versterking met 非常 en een vergelijking met 比.",
  ],
  vragen: [
    "De gekozen vraagvorm bepaalt welk soort antwoord je verwacht. 吗 vraagt bevestiging, A不A legt de keuze tussen positief en negatief voor, een vraagwoord vraagt ontbrekende informatie en 呢 houdt een bekend onderwerp actief.",
    "Voeg geen 吗 toe aan een zin die al een vraagwoord of een A不A-constructie bevat. 你去不去吗 mengt twee volledige vraagstrategieën.",
    "Zet een mededelende zin om in vier vraagtypes en formuleer bij elk type een natuurlijk kort antwoord.",
  ],
  ontkenning: [
    "不 ontkent doorgaans gewoonten, eigenschappen, intenties en toekomstige handelingen. 没(有) ontkent voltooiing, ervaring of bezit. De keuze vertelt dus mee hoe de spreker de situatie in de tijd bekijkt.",
    "Gebruik geen 不 bij 有: niet hebben is 没有. Ontken een voltooide handeling ook niet automatisch met 不 omdat het Nederlands gewoon niet gebruikt.",
    "Sorteer tien zinnen in gewoonte, toekomst, voltooid verleden en bezit en kies pas daarna 不 of 没有.",
  ],
  "de-bezit": [
    "的 verbindt een bepaling met een zelfstandig naamwoord en kan het bekende naamwoord later vervangen. Bij hechte relaties en vaste categorieën wordt 的 vaak weggelaten, terwijl langere of contrasterende beschrijvingen het juist nodig hebben.",
    "Plaats de beschrijving niet na het naamwoord zoals in het Nederlands. De volledige bepaling, zelfs een lange bijzin, staat vóór 的 en het beschreven woord.",
    "Breid een eenvoudig naamwoord stap voor stap uit met een bezitter, een eigenschap en een volledige relatieve zin.",
  ],
  "getallen-maatwoorden": [
    "Een telwoord kan meestal niet rechtstreeks voor een zelfstandig naamwoord staan. Het maatwoord categoriseert wat geteld wordt. 个 is breed inzetbaar, maar specifiekere maatwoorden geven vaak extra informatie over vorm, soort of gebruik.",
    "Gebruik 两 vóór een maatwoord voor twee exemplaren, maar 二 in telefoonnummers, reeksen en rekenkundige vormen. 个 is niet voor elk woord de natuurlijkste keuze.",
    "Kies voor tien concrete voorwerpen eerst het passende maatwoord en bouw daarna de volledige groep met getal en naamwoord.",
  ],
  tijd: [
    "Van groot naar klein is de standaardvolgorde: jaar, maand, dag, dagdeel, uur en minuut. Frequentie kan met 每, 次, 常常 of een tijdsduur worden uitgedrukt; elk antwoordt op een andere tijdsvraag.",
    "Gebruik 点 voor klokuren en 小时 voor een duur. 三点 is drie uur op de klok, 三个小时 is gedurende drie uur.",
    "Plan een denkbeeldige week en zeg voor vijf afspraken zowel datum, tijdstip als frequentie hardop.",
  ],
  "plaats-zai-you": [
    "在 lokaliseert een bekend onderwerp, terwijl 有 vanuit een plaats introduceert wat daar aanwezig is. De keuze weerspiegelt perspectief: waar is X tegenover wat bevindt zich op plaats Y.",
    "Verwissel 在 en 有 niet op basis van het Nederlandse er is. 桌子上有一本书 introduceert het boek; 书在桌子上 lokaliseert datzelfde bekende boek.",
    "Beschrijf één kamer tweemaal: eerst door nieuwe objecten met 有 te introduceren, daarna door hun locatie met 在 te preciseren.",
  ],
  "modale-werkwoorden": [
    "能, 会, 可以, 想, 要 en 应该 staan vóór het hoofdwerkwoord, maar drukken verschillende bronnen van mogelijkheid of noodzaak uit: vermogen, aangeleerde vaardigheid, toestemming, wens, plan of advies.",
    "Vertaal kunnen niet automatisch met 会. Voor een aangeleerde vaardigheid past 会, voor omstandigheden 能 en voor toestemming vaak 可以.",
    "Neem vijf situaties rond reizen of werk en formuleer telkens vaardigheid, praktische mogelijkheid, toestemming, wens en advies.",
  ],
  le: [
    "Werkwoordelijk 了 begrenst een gebeurtenis; zinsfinale 了 signaleert een nieuwe toestand of verandering. Beide kunnen samen voorkomen, en geen van beide is simpelweg een algemene verleden tijd.",
    "Voeg 了 niet automatisch aan elk verleden werkwoord toe. Gewoonten, achtergrondbeschrijving en ontkende voltooiing met 没 gebruiken vaak geen 了.",
    "Vergelijk paren met en zonder 了 en beschrijf welk verschil in voltooiing of actuele situatie ontstaat.",
  ],
  "zai-zhe": [
    "在/正在 focust op een handeling die bezig is. 着 presenteert vaker een voortdurende toestand of achtergrond die door een handeling is ontstaan. De twee perspectieven kunnen in één scène naast elkaar voorkomen.",
    "Gebruik 着 niet als algemene vertaling van aan het + infinitief. Voor een dynamische lopende activiteit is 在 meestal natuurlijker.",
    "Beschrijf een foto: geef eerst de achtergrondhoudingen met 着 en daarna de lopende activiteiten met 正在.",
  ],
  guo: [
    "过 presenteert een gebeurtenis als levenservaring zonder een specifiek afgesloten moment centraal te stellen. Zodra tijdstip, opeenvolging of gevolgen belangrijk worden, past een gewone gebeurtenisconstructie vaak beter.",
    "Combineer 过 niet gedachteloos met een exact tijdstip alsof het een gewone verleden tijd is. 昨天去了 beschrijft gisteren; 去过 zegt ooit geweest zijn.",
    "Maak vragen over vijf ervaringen met 过 en geef zowel positieve als negatieve antwoorden met 没.",
  ],
  vergelijken: [
    "比 introduceert de vergelijkingsbasis vóór het adjectief. Het verschil kan na het adjectief volgen. 没有 drukt minder dan uit vanuit het onderwerp, terwijl 一样 gelijkheid aangeeft en vaak met 跟 of 和 combineert.",
    "Gebruik bij een neutrale 比-vergelijking doorgaans geen 很 vóór het adjectief. Een groot verschil zet je achter de eigenschap met 得多 of 多了.",
    "Vergelijk drie steden op grootte, weer en afstand en formuleer ook minstens één gelijkheid en één negatieve vergelijking.",
  ],
  resultaatcomplementen: [
    "Een resultaatcomplement vormt met het werkwoord één gebeurteniskern: 看见 is erin slagen te zien, 写完 is klaar schrijven en 听懂 is door luisteren begrijpen. Mogelijkheid wordt vaak tussen beide delen geplaatst.",
    "Vertaal werkwoord en resultaat niet als twee losse opeenvolgende handelingen. 听懂 gaat over het bereikte luisterresultaat, niet over eerst luisteren en daarna begrijpen.",
    "Combineer vijf basiswerkwoorden met verschillende resultaten en maak vervolgens de mogelijke en onmogelijke vorm met 得 of 不.",
  ],
  richtingcomplementen: [
    "来 en 去 kiezen richting ten opzichte van een referentiepunt, meestal spreker of gesprekspartner. Samengestelde complementen voegen een ruimtelijk pad toe, zoals 上, 下, 进, 出, 回, 过 of 起.",
    "Kies 来 en 去 niet uitsluitend vanuit de locatie van het grammaticale onderwerp. Bepaal eerst waar het relevante gespreksperspectief ligt.",
    "Teken een kamer met deur en trap en beschrijf bewegingen naar en van jouw positie met minstens zes richtingcomplementen.",
  ],
  "de-complement": [
    "得 opent na een werkwoord een beoordeling van manier, graad of resultaat. Wanneer het werkwoord al een voorwerp heeft, wordt het werkwoord vaak herhaald om het 得-complement helder aan te sluiten.",
    "Verwar complement-得 niet met bezits-的 of bijwoordelijk 地. Ze klinken gelijk, maar hun positie en functie zijn verschillend.",
    "Neem één werkwoord en beschrijf ermee snelheid, kwaliteit en graad via drie verschillende 得-complementen.",
  ],
  "relatieve-zinnen": [
    "Een Chinese relatieve zin staat volledig vóór het naamwoord en eindigt daar met 的. Er is geen apart betrekkelijk voornaamwoord voor die/dat/wie; de ontbrekende rol wordt uit de context begrepen.",
    "Begin niet met het naamwoord en voeg de beschrijving erachter toe. Bouw eerst de volledige bepalende zin, plaats 的 en noem pas daarna het hoofdwoord.",
    "Maak van vijf korte zinnen naamwoordgroepen, bijvoorbeeld de persoon die ik gisteren zag of het boek dat op tafel ligt.",
  ],
  ba: [
    "把 past wanneer een specifiek, bekend voorwerp zichtbaar wordt behandeld en de zin vertelt wat ermee gebeurt. Na het werkwoord staat daarom meestal een resultaat, richting, plaats, hoeveelheid of andere duidelijke uitwerking.",
    "Gebruik 把 niet alleen om het voorwerp vooraan te zetten. Een kaal werkwoord zonder effect, zoals 我把书看, voelt onvolledig.",
    "Zoek in vijf gewone zinnen het concrete effect op het voorwerp en herschrijf alleen de geschikte gevallen als 把-zin.",
  ],
  bei: [
    "被 legt de aandacht op wat een gebeurtenis ondergaat. De uitvoerder kan genoemd of weggelaten worden. In modern Chinees hoeft de gebeurtenis niet negatief te zijn, al zijn ongunstige situaties erg gebruikelijk.",
    "Maak niet elke Nederlandse passiefzin mechanisch met 被. Chinees kan de ondergane zaak als onderwerp nemen zonder 被, zoals 问题解决了; de uitvoerder blijft dan ongenoemd.",
    "Vertel drie situaties eerst actief en daarna vanuit het getroffen voorwerp met 被; vergelijk welke focus verandert.",
  ],
  "shi-de": [
    "是…的 kadert een bekende of reeds gebeurde gebeurtenis en stelt één detail scherp, bijvoorbeeld tijd, plaats, manier of uitvoerder. Het bevestigt niet primair óf de gebeurtenis plaatsvond.",
    "Gebruik 是…的 niet als algemene verleden tijd. Wanneer de gebeurtenis zelf nieuw of onzeker is, is een gewone zin vaak beter.",
    "Neem één reisgebeurtenis en benadruk achtereenvolgens wie, wanneer, waar en hoe door telkens een ander deel vóór 的 te plaatsen.",
  ],
  verbanden: [
    "Chinese verbindingsparen maken de logica vaak aan beide kanten expliciet: 因为…所以…, 虽然…但是… en 如果…就…. In natuurlijke taal kan één helft wegvallen wanneer de relatie al duidelijk is.",
    "Plaats de verbindingswoorden niet willekeurig rond dezelfde zin. Ze openen elk hun eigen deelzin en sturen de relatie tussen voorwaarden, oorzaak en tegenstelling.",
    "Combineer telkens twee eenvoudige mededelingen tot een oorzaak, tegenstelling en voorwaarde en laat daarna waar mogelijk één helft natuurlijk weg.",
  ],
  "topic-comment": [
    "Chinees kan eerst vastleggen waarover de zin gaat en daar vervolgens iets over zeggen. Dat topic hoeft niet hetzelfde te zijn als het grammaticale onderwerp van de handeling.",
    "Analyseer elke vooropgeplaatste naamwoordgroep niet automatisch als onderwerp. In 这本书我看过, is 我 degene die heeft gelezen en 这本书 het gesprekstopic.",
    "Neem vijf gewone zinnen en plaats een reeds bekend object of tijdskader vooraan als topic zonder de interne zinsbouw te beschadigen.",
  ],
  "lian-dou": [
    "连 markeert een onverwacht of extreem geval; 都 of 也 geeft aan dat zelfs dit grensgeval onder de uitspraak valt. De constructie maakt de schaal en de verrassing expliciet.",
    "Laat 都/也 niet zomaar weg, want 连 alleen voltooit de nadrukconstructie meestal niet. Kies ook een element dat werkelijk als opvallend grensgeval kan dienen.",
    "Bedenk drie schalen, zoals makkelijk tot moeilijk, en formuleer telkens wat zelfs bij het meest onverwachte geval waar is.",
  ],
  kennismaken: [
    "Een natuurlijke introductie wordt aangepast aan context. Naam, herkomst en beroep volstaan vaak; leeftijd, burgerlijke staat en exacte functie kunnen afhankelijk van situatie persoonlijk of juist heel normaal zijn.",
    "Vertaal aangenaam kennis te maken niet altijd als een lange vaste formule. 很高兴认识你 is correct, maar in informele situaties volstaat een eenvoudige begroeting vaak.",
    "Maak een informele en een zakelijke introductie van elk ongeveer twintig seconden en neem ze op.",
  ],
  restaurant: [
    "Bestellen is meer dan gerechten noemen: je vraagt beschikbaarheid, portiegrootte, smaak, allergenen, bereidingswijze en rekening. 来, 要 en 点 kunnen allemaal bij bestellen voorkomen, met verschillende toon en context.",
    "Gebruik 我要 zonder verzachting niet in elke situatie. Het is grammaticaal, maar 请, 想 en een passende beleefde intonatie kunnen natuurlijker zijn.",
    "Speel een volledige restaurantscène van tafel vragen tot betalen en neem minstens één wijziging aan een gerecht op.",
  ],
  winkelen: [
    "Bij winkelen combineer je demonstratieven, maatwoorden, eigenschappen en vergelijkingen. 的 kan een bekend product vervangen, zoals 大一点的: degene die iets groter is.",
    "Verwar 一点 en 有点 niet. 大一点 vraagt een beetje groter; 有点大 beoordeelt iets als wat te groot.",
    "Oefen een aankoopgesprek met prijs, kleur, maat, vergelijking, korting en betaalwijze.",
  ],
  "richting-vragen": [
    "Een bruikbare route bevat vertrekpunt, richting, herkenningspunt, afstand en eindlocatie. 往 geeft de bewegingsrichting, 到 het bereikte punt en 在 de uiteindelijke locatie.",
    "Vraag niet alleen 在哪儿 wanneer je eigenlijk stapsgewijze instructies nodig hebt. Gebruik 怎么走 en controleer daarna het eerste oriëntatiepunt.",
    "Teken een eenvoudige wijkkaart en geef een route met twee afslagen, een herkenningspunt en een vervoermiddel.",
  ],
  initialen: [
    "De belangrijkste tegenstelling bij b/p, d/t, g/k, z/c, zh/ch en j/q is aspiratie: wel of geen sterke luchtstoot. Stemgebruik speelt veel minder dezelfde rol als in het Nederlands.",
    "Maak j, q en x niet met dezelfde tongpositie als zh, ch en sh. De eerste reeks ligt vooraan en hoog tegen het harde gehemelte.",
    "Neem minimale paren op met een papiertje voor je mond en controleer tegelijk luchtstoot en tongpositie.",
  ],
  finalen: [
    "Finalen veranderen soms zichtbaar door spellingconventies, terwijl de onderliggende klankstructuur behouden blijft. -n sluit vooraan in de mond; -ng eindigt verder achteraan en laat de klinker vaak anders resoneren.",
    "Voeg geen hoorbare w of j toe waar pinyin alleen een spellingsein geeft. Spreek de finale als één vloeiende klankbeweging uit.",
    "Oefen reeksen met -n en -ng, daarna ü tegenover u, en sluit af met de verkorte spellingen iu, ui en un.",
  ],
  toonparen: [
    "Toonparen trainen de overgang tussen contouren. Een toon wordt niet geïsoleerd opnieuw gestart; hij anticipeert op de volgende lettergreep terwijl de lexicale tegenstelling behouden blijft.",
    "Laat bij twee vierde tonen de eerste daling niet zo diep eindigen dat de tweede geen bereik meer heeft. Elke lettergreep moet nog een herkenbare contour houden.",
    "Doorloop alle zestien combinaties van vier tonen met vaste tweesyllabige woorden en herhaal de zwakste paren dagelijks.",
  ],
  "pinyin-tekst": [
    "Pinyin volgt woordgrenzen, niet karaktergrenzen. Zinsritme ontstaat door betekenisgroepen: inhoudswoorden dragen meer gewicht, terwijl deeltjes en bekende informatie lichter worden.",
    "Pauzeer niet na elk karakter. Dat maakt zelfs correcte tonen moeilijk verstaanbaar omdat de luisteraar geen woorden en zinsdelen meer hoort.",
    "Markeer in een pinyintekst woordgroepen met schuine strepen, lees traag en verklein daarna de onnatuurlijke pauzes.",
  ],
  streekvolgorde: [
    "Streekvolgorde ondersteunt motorisch geheugen, digitale handschriftherkenning en correcte verhoudingen. Regels kunnen botsen; dan geldt de conventionele volgorde van het specifieke karakter.",
    "Teken niet eerst een perfect kader en vul het daarna willekeurig. Bij omsluitende structuren blijft een sluitende streek vaak bewust tot het einde open.",
    "Bekijk de animatie, schrijf uit het geheugen en vergelijk niet alleen de vorm maar ook de beweging en proporties.",
  ],
  "radicalen-componenten": [
    "De woordenboekradicaal is een indexeerkeuze en niet noodzakelijk het inhoudelijk belangrijkste deel. Voor leren zijn alle terugkerende componenten relevant, inclusief hun positievarianten.",
    "Noem elk zichtbaar deel niet radicaal. Een karakter heeft voor traditionele opzoeking gewoonlijk één gekozen 部首, maar kan meerdere leerzame componenten bevatten.",
    "Maak voor tien karakters een componentenkaart met vormvariant, positie, mogelijke betekenis en eventuele klankfunctie.",
  ],
  klankreeksen: [
    "Fonetische families weerspiegelen oudere uitspraken. Daarom kunnen beginmedeklinker, finale of toon verschoven zijn, maar blijft vaak een herkenbare klankverwantschap bestaan.",
    "Verwacht niet dat één klankcomponent altijd exact dezelfde moderne pinyin oplevert. Gebruik de familie als geheugensteun, niet als uitspraakgarantie.",
    "Verzamel vijf karakters rond één fonetische component en noteer systematisch wat in klank en betekenis gelijk of verschillend is.",
  ],
  "vereenvoudigd-traditioneel": [
    "Vereenvoudiging gebeurde op karakter- en componentniveau. Sommige relaties zijn één-op-één, terwijl één vereenvoudigde vorm meerdere traditionele karakters kan vertegenwoordigen afhankelijk van betekenis.",
    "Zet tekst niet karakter voor karakter om zonder context. Bij samengevoegde vormen kan alleen woordbetekenis bepalen welke traditionele vorm correct is.",
    "Leer eerst twintig frequente componentomzettingen en oefen daarna herkenning in volledige woorden in plaats van losse tekens.",
  ],
  "formele-getallen": [
    "Financiële cijfers 大写 voorkomen eenvoudige wijzigingen op cheques, facturen en contracten. Ze worden gecombineerd met eenheden als 元, 角 en 分 en volgen vaste schrijfconventies.",
    "Gebruik formele vormen niet als stilistische variant in gewone tellingen. Ze horen vooral thuis in juridische en financiële context.",
    "Schrijf vijf bedragen eerst met cijfers, daarna in gewone Chinese getallen en ten slotte in financiële 大写-vorm.",
  ],
  "begroeten-afscheid": [
    "Groeten hangen af van relatie, tijd en situatie. 你好吗 is grammaticaal maar minder universeel als dagelijkse begroeting dan leerboeken suggereren; vragen als 吃了吗 kunnen relationeel zijn zonder letterlijk eetonderzoek te vragen.",
    "Gebruik 再见 niet verplicht na elk kort informeel contact. Situatiegerichte afscheidsgroeten zoals 慢走 of 明天见 klinken vaak natuurlijker.",
    "Koppel vijf dagelijkse situaties aan een passende opening én afsluiting en let op leeftijd en formaliteit.",
  ],
  "namen-titels": [
    "Een Chinese familienaam staat vóór de persoonlijke naam. Aanspreken kan met volledige naam, familienaam plus titel, of een relationele vorm. Alleen de persoonlijke naam gebruiken veronderstelt vaak nabijheid.",
    "Neem niet aan dat het laatste deel de familienaam is. Vraag bij twijfel 你贵姓 of 请问您怎么称呼 en volg de vorm die de persoon zelf gebruikt.",
    "Oefen een formele kennismaking, een gesprek met een collega en een informele ontmoeting met passende aanspreekvormen.",
  ],
  "ja-nee-antwoorden": [
    "Chinees antwoordt meestal door het werkwoord of adjectief van de vraag te herhalen of te ontkennen. 是 en 不是 passen vooral bij vragen met 是; 是的 kan daarnaast een bewering bevestigen.",
    "Vertaal ja niet altijd als 是 en nee niet altijd als 不是. Op 你去吗 antwoord je 去 of 不去.",
    "Laat iemand tien korte vragen stellen en antwoord telkens eerst minimaal en daarna in een volledige zin.",
  ],
  "bedanken-verontschuldigen": [
    "谢谢, 不好意思 en 对不起 dekken verschillende sociale handelingen. 不好意思 is vaak lichter en kan ook een verzoek inleiden; 对不起 erkent duidelijker verantwoordelijkheid of schade.",
    "Reageer niet op elk bedankje met een letterlijk equivalent van geen probleem. 不客气, 没事 en 不用谢 passen in verschillende situaties.",
    "Speel drie scenario's met kleine hinder, echte fout en ontvangen hulp en kies telkens formulering plus reactie.",
  ],
  "geld-betalen": [
    "Bedragen gebruiken 块 en 毛 informeel, 元 en 角 formeler. Betaalgesprekken omvatten contant, kaart, mobiele betaling, wisselgeld, bon en gesplitst betalen.",
    "Verwar 二 en 两 niet in bedragen en aantallen. De vorm hangt af van plaats in het getal en de volgende eenheid.",
    "Lees tien willekeurige prijzen hardop en voer daarna een gesprek over betaalwijze en wisselgeld.",
  ],
  kalender: [
    "Chinese data lopen van groot naar klein. 星期, 周 en 礼拜 kunnen weekdagen vormen; afspraken vragen vaak ook naar beschikbaarheid, duur en verplaatsing.",
    "Zet maand en dag niet in Europese volgorde. 五月三号 is 3 mei, niet 5 maart.",
    "Plan vijf afspraken, stel voor elke afspraak een alternatief voor en bevestig datum, tijd en plaats.",
  ],
  luchthaven: [
    "Op een luchthaven heb je taal nodig voor paspoortcontrole, bagage, overstap, aankomsthal en vervoer. 航班 verwijst naar de vlucht, 登机口 naar de gate en 行李领取处 naar bagageafhaling.",
    "Verwar de luchthavenwoorden niet: 到达 is aankomen, 出发 vertrekken en 起飞 opstijgen. 到 alleen betekent bereiken, nooit vertrekken.",
    "Doorloop een volledige aankomst: vluchtinformatie begrijpen, bagage zoeken, een probleem melden en vervoer naar de stad vragen.",
  ],
  "landen-nationaliteit": [
    "国, 人, 语 en 文 bouwen verwante maar verschillende begrippen: land, persoon, gesproken taal en taal of schrift. Niet elke taalnaam volgt exact hetzelfde patroon.",
    "Verwar 中国人, 中文 en 汉语 niet. Ze verwijzen respectievelijk naar persoon, Chinese taal/schrift en de Han-Chinese taal.",
    "Stel vijf personen voor met land, nationaliteit, gesproken talen en woonplaats zonder de achtervoegsels te verwisselen.",
  ],
  dranken: [
    "Bij drank bestellen combineer je soort, temperatuur, ijs, suiker, hoeveelheid en verpakking. 热, 常温 en 冰 beschrijven temperatuur; 少糖 en 无糖 sturen de zoetheid.",
    "Verwar 冰 met 冷 niet in vaste bestelcombinaties. De concrete formulering hangt ook af van drank en regio.",
    "Bestel drie dranken volledig gespecificeerd en laat de gesprekspartner telkens één detail ter bevestiging herhalen.",
  ],
  "studie-lessen": [
    "学习 is het algemene proces van leren; 学 kan een vak of vaardigheid nemen; 上课 is les volgen of geven, afhankelijk van het onderwerp, en 复习 is herhalen. 成绩, 作业 en 考试 beschrijven verschillende onderwijsresultaten en taken.",
    "Gebruik 教 en 学 niet omgekeerd. De docent 教, de leerling 学; 教书 betekent lesgeven als beroep.",
    "Beschrijf je weekrooster, favoriete vak, moeilijkste onderdeel, huiswerk en manier van herhalen.",
  ],
  "werk-beroepen": [
    "工作 kan zelfstandig naamwoord en werkwoord zijn. 上班 focust op naar of aan het werk zijn; 下班 op stoppen. 职业, 职位 en 专业 zijn beroep, functie en studierichting.",
    "Vertaal werk niet steeds met 工作 wanneer je werkplek, functie of diensttijd bedoelt. Kies het specifieke perspectief.",
    "Maak een zakelijke introductie met organisatie, afdeling, functie, verantwoordelijkheden en werkritme.",
  ],
  "of-en": [
    "还是 verbindt alternatieven in een keuzevraag, 或者 in een mededeling. 和 verbindt vooral naamwoordgroepen; voor opeenvolgende of volledige zinnen zijn 而且, 也 en andere verbanden natuurlijker.",
    "Gebruik 或者 niet automatisch in een directe of-vraag en verbind twee volledige werkwoordzinnen niet gedachteloos met 和.",
    "Schrijf vijf paren als keuzevraag en daarna als mededeling over mogelijke alternatieven.",
  ],
  cognitie: [
    "知道 is feitelijke kennis, 认识 vertrouwdheid met personen of plaatsen, 觉得 een persoonlijke indruk, 认为 een meer uitgewerkt oordeel en 明白/懂 het begrijpen.",
    "Zeg niet 我知道他 wanneer je bedoelt dat je hem persoonlijk kent. Daar past 我认识他.",
    "Formuleer rond één onderwerp een feit, persoonlijke indruk, beargumenteerd standpunt en begrip of onbegrip.",
  ],
  "doel-bestemming": [
    "去 en 到 richten beweging op een bestemming; 为了 introduceert een doelreden en 来 kan de functie of bedoeling van een handeling markeren. Doel en bestemming zijn dus niet hetzelfde grammaticale begrip.",
    "Gebruik 给 niet als algemene vertaling van voor wanneer het om doel gaat. 给 markeert vaak ontvanger of begunstigde.",
    "Beschrijf drie reizen met bestemming, reden, ontvanger en beoogd resultaat als afzonderlijke elementen.",
  ],
  "voor-na-wanneer": [
    "以前 en 以后 kunnen relatief aan nu of aan een expliciet referentiepunt staan. 的时候 maakt van een gebeurtenis een tijdskader; 之前 en 之后 klinken vaak compacter of formeler.",
    "Verwar 以前 (vóór of vroeger) niet met 以后 (na of later). Zet de referentiegebeurtenis vóór het tijdswoord: 吃饭以后, na het eten.",
    "Vertel een dag in drie fasen en verbind gebeurtenissen met vóór, tijdens en nadat.",
  ],
  "cai-jiu": [
    "才 presenteert iets als later, minder of moeilijker dan verwacht; 就 als vroeger, sneller of vanzelfsprekender. De woorden geven dus het verwachtingsstandpunt van de spreker weer.",
    "Vertaal 才 en 就 niet alleen met klokwoorden. Zonder de impliciete verwachting te begrijpen mis je waarom de spreker ze kiest.",
    "Neem dezelfde tijd of hoeveelheid en maak twee zinnen die door 才 en 就 een tegengestelde evaluatie krijgen.",
  ],
  duur: [
    "Een tijdsduur kan na het werkwoord of na het voorwerp komen, afhankelijk van werkwoord en structuur. 离…还有… geeft resterende afstand in tijd; 已经…了 markeert verstreken tijd tot nu.",
    "Verwar een tijdstip met een duur en een frequentie. 三点, 三个小时 en 三次 antwoorden op drie verschillende vragen.",
    "Beschrijf vijf activiteiten met starttijd, duur, frequentie en resterende tijd tot een deadline.",
  ],
  "muziek-voorkeur": [
    "喜欢 beschrijft voorkeur, 爱 vaak een sterkere of duurzamere liefde, 对…感兴趣 belangstelling en 最喜欢 een favoriet. Stijl, artiest, lied en instrument vragen elk hun eigen zelfstandig naamwoord.",
    "Gebruik 比较喜欢 niet altijd als letterlijke vergelijking. Het kan ook een verzachtende voorkeur betekenen: ik hou eerder van.",
    "Bespreek drie genres met voorkeur, reden, favoriete artiest en een vergelijking.",
  ],
  "sport-scores": [
    "打 en 踢 combineren met verschillende sporten; 比赛 kan wedstrijd of deelnemen aan een wedstrijd betekenen. Scores gebruiken 比 tussen twee cijfers, terwijl 赢, 输 en 打平 de uitslag beschrijven.",
    "Lees 3比2 niet als een gewone vergelijking met het grammaticale 比-patroon. In scores verbindt het de punten.",
    "Geef live commentaar op een denkbeeldige wedstrijd met teams, stand, voorsprong, uitslag en eigen mening.",
  ],
  weer: [
    "Weerbeschrijving combineert 天气, temperatuur, neerslag, wind, luchtvochtigheid en verandering. 冷 en 热 zijn ervaring; 温度 is de meetbare temperatuur.",
    "Gebruik 下 met neerslag zoals 下雨 en 下雪, maar niet als algemene werkwoordsvorm voor elk weertype.",
    "Geef een driedaagse weersverwachting en voeg per dag passende kleding of activiteit toe.",
  ],
  taalvaardigheid: [
    "会说 geeft vaardigheid, 说得流利 beoordeelt uitvoering, 听得懂 resultaatmogelijkheid en 没听清 feitelijk niet duidelijk horen. Deze vormen onderscheiden kennis, niveau en concreet communicatieprobleem.",
    "Zeg niet alleen 我不懂 wanneer het probleem volume, snelheid, woordenschat of accent is. Een preciezere zin levert betere hulp op.",
    "Oefen herstelzinnen voor herhalen, trager spreken, schrijven, uitleggen en bevestigen wat je begrepen hebt.",
  ],
  "verbinden-tekst": [
    "Een samenhangende tekst gebruikt niet alleen voegwoorden, maar ook tijdskaders, terugverwijzingen, topiccontinuïteit en gecontroleerde weglating. Te veel expliciete verbindingswoorden klinkt zwaar.",
    "Rijg geen zinnen aaneen met 然后 alleen. Kies oorzaak, tegenstelling, toevoeging of gevolg wanneer dat de werkelijke relatie is.",
    "Maak van zes losse zinnen één alinea en schrap daarna alle verbindingswoorden die de context niet nodig heeft.",
  ],
  "vervoer-samen": [
    "坐 noemt een vervoermiddel waarin je reist, 骑 een bereden tweewieler of dier, 开 het besturen en 走路 te voet gaan. 跟 en 和 introduceren gezelschap; 一起 benadrukt samen handelen.",
    "Zeg niet 坐车 wanneer het belangrijk is dat jij zelf rijdt. Dan is 开车 preciezer.",
    "Plan drie verplaatsingen en vermeld telkens gezelschap, vervoermiddel, bestuurder, vertrek en overstap.",
  ],
  "verleden-vertellen": [
    "Een Chinees verhaal bouwt verleden niet met één werkwoordstijd op. Tijdwoorden zetten het kader; 了, 过, 在 en 着 tonen voltooiing, ervaring, voortgang en achtergrond waar nodig.",
    "Zet niet achter elk werkwoord 了. In een reeks gebeurtenissen kan aspect selectief of door context al duidelijk zijn.",
    "Vertel gisteren in zes zinnen met een achtergrond, drie opeenvolgende gebeurtenissen en een onverwacht resultaat.",
  ],
  "maatwoorden-verdieping": [
    "Specifieke maatwoorden categoriseren naar vorm, gebondenheid, inhoud of sociale conventie. Ze kunnen de bedoelde betekenis veranderen, zoals een exemplaar, set, portie of gebeurtenis.",
    "Gebruik 个 niet als veilige eindoplossing wanneer een frequent maatwoord bekend is. Men begrijpt je vaak, maar de uitdrukking blijft onnatuurlijk of minder precies.",
    "Groepeer twintig woorden volgens vorm, recipiënt, verzameling en gebeurtenis en leer het maatwoord als deel van de woordenschat.",
  ],
  "volgorde-sequentie": [
    "先…再… ordent geplande stappen, 先…然后… vertelt een neutrale reeks en 一…就… koppelt twee gebeurtenissen zeer direct. Daarna kunnen 才 en 就 de verwachting over timing kleuren.",
    "Gebruik 再 niet zomaar voor elke Nederlandse opnieuw of daarna. 再 kijkt vaak vooruit; 又 beschrijft vaker herhaling die al plaatsvond.",
    "Leg een procedure met vijf stappen uit en voeg één voorwaarde en één onmiddellijke reactie toe.",
  ],
  onderhandelen: [
    "Onderhandelen varieert sterk per winkeltype. Je kunt prijs, hoeveelheid, kwaliteit en gebundelde aankoop bespreken. Beleefde vragen met 能不能, 可以吗 en 再…一点 laten ruimte voor antwoord.",
    "Begin niet automatisch overal af te dingen. In vasteprijswinkels, ketens en veel moderne omgevingen is onderhandelen niet passend.",
    "Speel koper en verkoper met openingsprijs, tegenvoorstel, reden, bundelkorting en beleefde afsluiting.",
  ],
  "kleding-kleuren": [
    "Kledingtaal combineert kledingstuk, maatwoord, kleur, materiaal, maat en pasvorm. 穿 beschrijft dragen of aantrekken, 戴 geldt voor accessoires en 试穿 voor passen.",
    "Verwar 好看 niet met 合适. Het eerste beoordeelt uiterlijk; het tweede of iets geschikt is of past.",
    "Vergelijk twee outfits op kleur, maat, pasvorm, gelegenheid en prijs en vraag een andere variant.",
  ],
  "zhe-achtergrond": [
    "着 laat een toestand voortduren en kan achtergrond leveren voor een andere handeling: een deur staat open terwijl iemand binnenkomt. Het volgt ook werkwoorden van houding of bevestiging.",
    "Gebruik 着 niet na elk werkwoord dat lang duurt. Het perspectief moet een aanhoudende toestand of begeleidende manier zijn.",
    "Beschrijf een drukke foto met drie houdingen of toestanden met 着 en drie hoofdhandelingen.",
  ],
  "dui-patronen": [
    "对 markeert het doelwit van houding, effect of behandeling. 对…来说 bepaalt vanuit wiens perspectief iets geldt; 对…感兴趣 drukt belangstelling uit.",
    "Verwar 对 met 跟. 对 richt een houding of effect op iemand; 跟 verbindt vaak gezelschap, vergelijking of communicatiepartner.",
    "Maak rond één onderwerp zinnen over houding tegenover, effect op en perspectief van verschillende personen.",
  ],
  gezondheid: [
    "Klachten worden vaak beschreven als lichaamsdeel plus 疼, 不舒服 of een concrete reactie. 得了 noemt een diagnose, 发烧 een symptoom en 过敏 een allergische reactie. Duur en ernst zijn cruciaal.",
    "Gebruik 是 niet vóór elk ziekte-adjectief. 我头疼 en 我不舒服 hebben al een volledig gezegde.",
    "Oefen een consult met klacht, locatie, begin, duur, ernst, bijkomende symptomen en medicatie.",
  ],
  onbepaald: [
    "Vraagwoorden krijgen met 都, 也 en context onbepaalde betekenissen: 谁都 iedereen, 谁也不 niemand, 什么都 alles. De negatie en het bereik bepalen de uiteindelijke interpretatie.",
    "Verwar 什么都不 (helemaal niets) niet met 不是什么都 (niet alles). De plaats van de ontkenning bepaalt het bereik.",
    "Bouw voor 谁, 什么, 哪儿 en 怎么 telkens een universele en een volledig negatieve zin.",
  ],
  werkwoordreduplicatie: [
    "Reduplicatie verkleint de duur of zwaarte van een handeling en kan een verzoek verzachten. Eensyllabige en tweesyllabige werkwoorden hebben verschillende patronen; aspect en object beïnvloeden de vorm.",
    "Redupliceer geen werkwoord dat geen beheersbare, korte handeling kan voorstellen. Toestanden en resultatieve verbindingen passen vaak niet.",
    "Zet vijf directe verzoeken om in lichtere uitnodigingen met VV, V一V of ABAB.",
  ],
  "verandering-cheng": [
    "成 markeert het bereikte nieuwe resultaat of de nieuwe vorm. 变成 beschrijft worden, 改成 bewust wijzigen naar en 翻译成 omzetten in een andere taal.",
    "Gebruik 成 niet wanneer alleen een graduele eigenschapsverandering wordt beschreven zonder duidelijk eindresultaat. Dan kan 变得 passender zijn.",
    "Beschrijf vijf omzettingen met beginvorm, handeling en concreet eindresultaat.",
  ],
  "levendige-eigenschappen": [
    "Adjectiefreduplicatie kan een levendige, beschrijvende kwaliteit geven. AABB- en ABAB-patronen zijn lexicaal beperkt en gedragen zich niet als een vrije mechanische regel voor elk adjectief.",
    "Verdubbel niet elk adjectief op goed geluk. Controleer of de vorm werkelijk gebruikelijk is en let op 的 en 地 in de zin.",
    "Verzamel tien frequente geredupliceerde eigenschappen en gebruik ze in een concrete plaats- of persoonsbeschrijving.",
  ],
  telefoneren: [
    "Telefoontaal vereist identificeren, de juiste persoon vragen, beschikbaarheid controleren, boodschap noteren en gegevens bevestigen. 喂 is een telefoonsignaal, niet zomaar dezelfde begroeting als 你好.",
    "Vraag niet te direct 你是谁 in een formeel telefoongesprek. 请问您是哪位 is beleefder.",
    "Speel een telefoongesprek waarin de gezochte persoon afwezig is en laat naam, nummer, reden en terugbelmoment bevestigen.",
  ],
  rijden: [
    "Verkeerstaal onderscheidt rijden, opstappen, afslaan, rijstrook, verkeerslicht, snelheidslimiet en parkeren. 开车 is zelf rijden; 坐车 is als passagier reizen.",
    "Vertaal parkeren niet overal hetzelfde. 停车 is parkeren of stoppen; 停车场 is parkeerterrein en 车位 parkeerplaats.",
    "Geef een autoroute met rijstrook, twee afslagen, verkeerslicht, snelheidsbeperking en parkeerinstructie.",
  ],
  "beleefdheid-etiquette": [
    "Beleefdheid zit in aanspreekvorm, woordkeuze, indirectheid, intonatie en situationele formules. 您, 请 en 麻烦 zijn middelen, maar een zin vol beleefdheidswoorden kan nog steeds onnatuurlijk zijn.",
    "Vertaal alstublieft niet bij elk Nederlands verzoek letterlijk met 请. Soms verzacht een vraagvorm of 麻烦你 beter.",
    "Herschrijf vijf directe opdrachten voor een vriend, collega, klant en oudere gesprekspartner.",
  ],
  "beijing-bezienswaardigheden": [
    "Reisplanning combineert bestemming, openingstijd, vervoer, toegang, duur en prioriteit. 参观 past bij bezoeken en bezichtigen, 逛 bij rondlopen en 游览 bij toeristisch verkennen.",
    "Gebruik 去了 niet zowel voor geweest zijn als voor vertrekken zonder context. 去过 drukt ervaring uit; 去了 beschrijft een concrete gebeurtenis.",
    "Maak een dagprogramma met drie plaatsen, reistijd, openingstijden, ticket en alternatief bij slecht weer.",
  ],
  verzoeken: [
    "De kracht van een verzoek wordt gestuurd door relatie en formulering: 请 is duidelijk beleefd, 能不能 vraagt mogelijkheid, 可以…吗 toestemming en 别 een negatief verzoek of verbod.",
    "Gebruik 给我… zonder passende context niet als standaardverzoek. Het kan snel als bevel klinken.",
    "Formuleer dezelfde handeling als vriendelijke suggestie, neutraal verzoek, dringend bevel en verbod.",
  ],
  recepten: [
    "Recepten gebruiken handelingen voor wassen, snijden, mengen, bakken, koken en kruiden, plus volgorde, duur, temperatuur en hoeveelheid. 把 is frequent omdat ingrediënten zichtbaar worden behandeld.",
    "Verwar 开水 met 水开了. Het eerste betekent gekookt of kokend water als naamwoord, het tweede dat het water nu kookt.",
    "Leg een eenvoudig recept uit met ingrediëntenlijst, vijf stappen, hoeveelheden, timing en één veiligheidswaarschuwing.",
  ],
  fotografie: [
    "Bij fotografie onderscheid je een foto nemen 拍照, iemand fotograferen 给…拍照, samen op de foto gaan 合影 en het beeld bekijken 看照片. 横着 en 竖着 beschrijven oriëntatie.",
    "Zeg niet alleen 拍我 wanneer je beleefd vraagt een foto van jou te nemen. 请帮我拍一张 is duidelijker en natuurlijker.",
    "Vraag een onbekende om een foto, geef compositie-instructies, controleer het resultaat en vraag beleefd een tweede opname.",
  ],
  "familie-verwantschap": [
    "Chinese verwantschapstermen coderen vaders- of moederskant, generatie, leeftijdsvolgorde en huwelijk. In dagelijks gebruik verschillen termen en aanspreekvormen bovendien per regio.",
    "Vertaal oom, tante, neef en nicht niet zonder de precieze familierelatie te kennen. Eén Nederlands woord kan meerdere Chinese termen hebben.",
    "Teken een familiestamboom van drie generaties en label elke relatie vanuit één gekozen persoon.",
  ],
  onderwijssysteem: [
    "Onderwijswoorden onderscheiden schoolniveau, studiejaar, richting, toelating, afstuderen en diploma. 上学 is naar school gaan of onderwijs volgen; 上大学 specifiek universitair studeren.",
    "Zet buitenlandse diploma's niet automatisch één-op-één om naar Chinese termen. Systemen en opleidingsniveaus komen niet altijd exact overeen.",
    "Beschrijf je eigen schoolloopbaan chronologisch en leg één verschil tussen twee onderwijssystemen voorzichtig uit.",
  ],
  "manier-de": [
    "地 maakt een bepaling bijwoordelijk vóór het werkwoord; 得 introduceert na het werkwoord een complement. 的 verbindt een bepaling met een naamwoord. In informele tekst worden sommige 地-vormen als 的 geschreven, maar de grammaticale rollen blijven anders.",
    "Kies niet op klank, want alle drie worden vaak de uitgesproken. Kijk naar wat erna of ervoor staat: naamwoord, werkwoord of complement.",
    "Analyseer tien zinnen door eerst hoofdwerkwoord en naamwoord te markeren en vul daarna 的, 地 of 得 in.",
  ],
  interjecties: [
    "Partikels en tussenwerpsels beheren beurtwisseling, verrassing, aarzeling, bevestiging en gedeelde kennis. Hun effect hangt sterk af van toonhoogte, duur en relatie tussen sprekers.",
    "Voeg 啊, 哦 of 嘛 niet toe op basis van één Nederlandse vertaling. Dezelfde vorm kan door intonatie vriendelijk, verbaasd, ongeduldig of vanzelfsprekend klinken.",
    "Luister naar korte dialogen, noteer de houding zonder eerst te vertalen en imiteer daarna de volledige intonatie.",
  ],
  "regionale-taal": [
    "普通话 is een gestandaardiseerde variëteit; 方言 is een brede Chinese categorie die zowel nauw verwante dialecten als onderling onverstaanbare Sinitische talen kan omvatten. 口音 beschrijft uitspraakaccent binnen een gesproken variëteit.",
    "Noem Kantonees niet zomaar slecht Mandarijn of alleen een accent. Taalvariatie raakt ook identiteit en regionale geschiedenis.",
    "Vraag respectvol welke taalvariëteiten iemand spreekt en beschrijf je eigen begrip zonder een waardeoordeel te geven.",
  ],
  "menukaart-verdieping": [
    "Gerechtnamen combineren ingrediënt, snijwijze, kooktechniek, smaak en soms een historische of beeldende naam. De woordvolgorde is compact en hoeft geen gewone zin te vormen.",
    "Neem 素菜 niet automatisch als garantie voor volledig veganistisch eten. Bouillon, reuzel, vissaus of ei kunnen afzonderlijk nagevraagd moeten worden.",
    "Ontleed tien gerechtnamen in hoofdingrediënt, bereiding en smaak en formuleer daarna vragen over allergenen en dieetvereisten.",
  ],
};

// Editorial review: questions test the target concept rather than translation alone.
const conceptQuestions: Record<string, [string, string[], number, string][]> = {"karakters-lezen":[["Welke component geeft vooral een klankaanwijzing in 妈？",["女","马","Beide betekenen mama"],1,"马 mǎ geeft een historische klankaanwijzing; 女 geeft het betekenisveld."],["Wat kun je uit 青 in 请 afleiden?",["De exacte toon","Een mogelijke klankverwantschap","Dat 请 blauw betekent"],1,"De klankfamilie is een aanwijzing, geen garantie."]],"pinyin":[["Welke klinker hoor je in 去 qù?",["oe","uu","oo"],1,"Na q staat u voor ü, ongeveer de Nederlandse uu."],["Waar blijven de puntjes van ü staan?",["qù","nǚ","xué"],1,"Na n en l is het onderscheid tussen u en ü nodig."]],"tonen":[["Welke toon heeft 买 mǎi?",["Tweede","Derde","Vierde"],1,"Het haakje markeert de derde toon, doorgaans laag in verbonden spraak."],["Hoe spreek je de tweede lettergreep van 妈妈 uit?",["Kort en licht","Altijd hoog en vlak","Altijd dalend"],0,"De tweede lettergreep is neutraal."]],"toonveranderingen":[["Hoe klinkt 你好 in verbonden spraak?",["nǐ háo","ní hǎo","nì hǎo"],1,"De eerste van twee derde tonen klinkt als een tweede toon."],["Hoe klinkt 一 in 一天?",["yī","yí","yì"],2,"Vóór een eerste, tweede of derde toon klinkt 一 meestal als yì."]],"basiszinsvolgorde":[["Welke zin betekent: morgen leer ik thuis Chinees?",["我学中文明天在家。","我明天在家学中文。","我在学中文家明天。"],1,"Tijd en plaats staan vóór de hoofdhandeling."],["Waar staat een tijdstip normaal?",["Vóór het werkwoord","Altijd na het voorwerp","Tussen werkwoord en voorwerp"],0,"Een tijdstip kan ook vóór het onderwerp staan."]],"shi":[["Vul aan: 我___老师。",["在","很","是"],2,"是 koppelt een persoon aan een identiteit of beroep."],["Welke zin betekent: zij heeft het druk?",["她是忙。","她很忙。","她有忙。"],1,"忙 kan zelf het gezegde vormen; 很 maakt de beschrijving neutraal."]],"hen-adjectieven":[["Welke zin is een neutrale beschrijving?",["他是高。","他很高。","他有高。"],1,"很 staat vóór het adjectief; 是 is niet nodig."],["Hoe zeg je: een beetje te duur?",["一点贵","有点贵","贵有点"],1,"有点 staat vóór de eigenschap en heeft vaak een negatieve nuance."]],"vragen":[["Welke zin is een gewone ja-neevraag?",["你喝茶吗？","你吗喝茶？","你喝吗茶？"],0,"吗 staat aan het einde."],["Waar staat 谁 in de vraag wie is hij?",["谁他是？","他是谁？","他谁是？"],1,"Het vraagwoord staat op de plaats van het antwoord."]],"ontkenning":[["Ik heb gisteren niet gegeten: welke ontkenning?",["不","没","别"],1,"没 ontkent een gebeurtenis die niet plaatsvond."],["Welke vorm ontkent bezit?",["不有","没有","有不"],1,"有 wordt met 没 ontkend."]],"de-bezit":[["Hoe zeg je mijn boek?",["书我的","我书的","我的书"],2,"Bezitter + 的 + naamwoord."],["Welke vorm is normaal voor mijn moeder?",["我妈妈","妈妈我","我妈的妈"],0,"Bij hechte familiebanden kan 的 wegvallen."]],"getallen-maatwoorden":[["Hoe zeg je twee boeken?",["二本书","两本书","两书本"],1,"两 staat doorgaans vóór een maatwoord."],["Welk maatwoord past bij een kop thee?",["本","张","杯"],2,"杯 telt kopjes of glazen."]],"tijd":[["Welke uitdrukking betekent gedurende drie uur?",["三点","三个小时","第三点"],1,"小时 is een duur; 点 is een kloktijd."],["Waar staat 明天 in een gewone zin?",["Vóór de handeling","Verplicht helemaal achteraan","Na het voorwerp"],0,"Een tijdstip geeft vooraf het kader."]],"plaats-zai-you":[["Hoe introduceer je een boek op tafel?",["桌子上有一本书。","桌子上在一本书。","一本书有桌子上。"],0,"Plaats + 有 introduceert wat er aanwezig is."],["Hoe lokaliseer je een bekend boek?",["书有桌子上。","书在桌子上。","在书桌子上。"],1,"Bekend voorwerp + 在 + plaats."]],"modale-werkwoorden":[["Je hebt leren zwemmen. Welk werkwoord past het best?",["会","要","必须"],0,"会 drukt een aangeleerde vaardigheid uit."],["Je hoeft niet te komen. Welke vorm?",["不要来","不用来","不能来"],1,"不用 betekent niet hoeven; 不要 is een negatief verzoek."]],"le":[["Welke zin meldt dat het weer veranderd is?",["下雨了。","不下雨。","下雨吗？"],0,"Zinsfinale 了 markeert een nieuwe situatie."],["Hoe ontken je 我买了一本书 in de betekenis dat je geen boek kocht?",["我不买了一本书。","我没买书。","我没买了书。"],1,"Bij ontkende voltooiing verdwijnt werkwoordelijk 了."]],"zai-zhe":[["Welke zin beschrijft een openstaande deur?",["门正在开。","门开着。","门开吗？"],1,"着 beschrijft de aanhoudende toestand."],["Hoe zeg je dat iemand nu leest?",["他在看书。","他看在书。","他是看书。"],0,"在 staat vóór de lopende activiteit."]],"guo":[["Welke zin vraagt naar een eerdere ervaring?",["你去中国吗？","你去过中国吗？","你在中国吗？"],1,"过 markeert ervaring."],["Hoe ontken je die ervaring?",["我不去过。","我没去过。","我没去。"],1,"没 + werkwoord + 过 behoudt het ervaringspartikel."]],"vergelijken":[["Welke zin betekent dat hij groter is dan ik?",["他比我高。","他比我很高。","他高比我。"],0,"De eigenschap volgt na 比 en de vergelijkingsbasis."],["Hoe zeg je dat ik niet zo groot ben als hij?",["我没有他高。","我不有他高。","我高没有他。"],0,"没有 introduceert hier de vergelijkingsbasis."]],"resultaatcomplementen":[["Je hebt geluisterd maar niet begrepen. Welke zin?",["我没听懂。","我没听。","我听得懂。"],0,"没听懂 ontkent het bereikte begrip, niet noodzakelijk het luisteren."],["Welke vorm betekent niet kunnen verstaan?",["没听懂","听不懂","不听"],1,"不 tussen werkwoord en resultaat drukt onmogelijkheid uit."]],"richtingcomplementen":[["Iemand komt jouw kamer binnen. Welke vorm?",["进来","进去","出来"],0,"进 is naar binnen; 来 is naar het gekozen referentiepunt."],["Welke volgorde is correct?",["回去家","回家去","家去回"],1,"Een plaats staat binnen het samengestelde richtingspatroon vóór 去."]],"de-complement":[["Welke zin beoordeelt de spreekvaardigheid?",["他说得很好。","他得说很好。","他很好得说。"],0,"得 volgt op het werkwoord en leidt de beoordeling in."],["Waar staat 不 in hij spreekt niet goed?",["他不说得好。","他说得不好。","他说不好得。"],1,"De ontkenning staat binnen het complement, na 得."]],"relatieve-zinnen":[["Hoe zeg je het boek dat ik kocht?",["书我买的","我买的书","我买书的书"],1,"De relatieve bepaling staat vóór 的 en het kernwoord."],["Wat is het kernwoord in 站在那边的人?",["站","那边","人"],2,"人 is het naamwoord dat de voorafgaande bepaling beschrijft."]],"ba":[["Welke zin vertelt wat er met de deur moet gebeuren?",["请把门关上。","请把关门。","请门把关。"],0,"把 introduceert het voorwerp; 关上 geeft het resultaat."],["Waar staat 没 in een 把-zin?",["Na 把","Vóór 把","Na het resultaat"],1,"Ontkenning en modale werkwoorden staan doorgaans vóór 把."]],"bei":[["Wie ondergaat de handeling in 我的自行车被人偷了?",["人","自行车","De spreker als uitvoerder"],1,"De fiets is het grammaticale onderwerp en ondergaat de diefstal."],["Welke zin betekent dat mijn fiets niet gestolen is?",["我的自行车被没偷。","我的自行车没被偷。","我的自行车被偷没。"],1,"没 staat vóór 被."]],"shi-de":[["Welke zin benadrukt wanneer ik kwam?",["我昨天来了。","我是昨天来的。","我明天来。"],1,"是…的 legt de nadruk op het detail 昨天."],["Hoe ontken je dat je per vliegtuig kwam?",["我不是坐飞机来的。","我没是坐飞机来的。","我是坐飞机不来的。"],0,"De ontkenning van het benadrukte detail is 不是…的."]],"verbanden":[["Welk woord past: 因为下雨，___我没去。",["但是","所以","虽然"],1,"所以 introduceert het gevolg."],["Vul aan: 如果你有时间，我们___一起去。",["就","虽然","因为"],0,"就 introduceert het gevolg van de voorwaarde."]],"topic-comment":[["Wie heeft gelezen in 这本书我看过?",["这本书","我","Onbekend"],1,"Het boek is het topic; 我 is het grammaticale onderwerp."],["Waarom staat 这本书 vooraan?",["Omdat het de uitvoerder is","Omdat het het gespreksonderwerp is","Omdat 过 een vraag vormt"],1,"Het topic is het kader waarover iets wordt gezegd."]],"lian-dou":[["Vul aan: 连孩子___懂。",["把","都","被"],1,"都 markeert dat zelfs kinderen het begrijpen."],["Welke zin benadrukt geen enkele keer?",["我连一次也没去过。","我去过一次。","我又去了一次。"],0,"连一次也没 versterkt de totale ontkenning."]],"kennismaken":[["Welke zin noemt je naam?",["我叫小明。","我在小明。","我有小明。"],0,"叫 wordt gebruikt voor hoe iemand heet."],["Hoe antwoord je op 您贵姓？",["我贵姓王。","我姓王。","我是贵姓。"],1,"In het antwoord gebruik je 姓 zonder 贵."]],"restaurant":[["Hoe vraag je om minder olie?",["不要油","少放一点油","多放一点油"],1,"少放 vraagt minder; 不要 vraagt weglaten."],["Hoe bestel je twee kopjes thee?",["二茶杯","两杯茶","两茶"],1,"Getal + maatwoord + drank."]],"winkelen":[["Hoe vraag je naar de prijs?",["这个多少钱？","这个几个人？","这个在哪里？"],0,"多少钱 vraagt naar het bedrag."],["Hoe vraag je om een groter exemplaar?",["有没有大一点的？","有没有有点大？","有没有一点大？"],0,"大一点 betekent iets groter; 的 vervangt het product."]],"richting-vragen":[["Welke vraag vraagt naar de route?",["火车站在哪儿？","去火车站怎么走？","火车站几点？"],1,"怎么走 vraagt hoe je er geraakt."],["Hoe zeg je dat het hotel ver van hier is?",["酒店在这里远。","酒店离这里远。","酒店有这里远。"],1,"离 introduceert het referentiepunt voor de afstand."]]};
const editorialAdditions: Record<string, { add: string[] }> = {"pinyin":{"add":["Een lettergreep kan zonder beginmedeklinker beginnen, zoals 爱 ài. Na y wordt de ü eveneens zonder puntjes geschreven: 鱼 yú. Na n en l blijven de puntjes staan wanneer de klank ü is: 女 nǚ, 绿 lǜ. Bij yun en jun staat un voor ün, niet voor uen."]},"toonveranderingen":{"add":["一 klinkt yí vóór een vierde toon en yì vóór een eerste, tweede of derde toon. Bij los tellen, rangtelwoorden en cijferreeksen blijft yī gebruikelijk. In werkwoordherhaling kan 一 neutraal worden: 看一看 kàn yi kàn. 不 kan eveneens neutraal zijn in A不A-vragen."]},"le":{"add":["Vergelijk 我买了一本书 (ik heb een boek gekocht), 我没买书 (ik heb geen boek gekocht) en 我不买书了 (ik koop geen boeken meer). In de laatste zin blijft zinsfinale 了 staan omdat de situatie verandert. Perfectief 了 kan ook bij toekomstige gebeurtenissen voorkomen: 吃了饭再走, vertrek nadat je gegeten hebt."]},"resultaatcomplementen":{"add":["Vergelijk 我没听懂 (ik heb het deze keer niet verstaan) en 我听不懂 (ik kan het niet verstaan). 不 kan ook vóór een resultaatcombinatie voorkomen bij bijvoorbeeld gewoonten of toekomstige keuzes; het verbod geldt dus niet absoluut."]},"shi-de":{"add":["In een ontkennende focuszin blijft 是 staan: 我不是坐飞机来的. Deze les behandelt de focusconstructie rond een bekende gebeurtenis; andere 是…的-constructies kunnen ook over huidige of toekomstige situaties gaan."]},"getallen-maatwoorden":{"add":["两 is gebruikelijk vóór maatwoorden, 百, 千 en 万 kunnen afhankelijk van positie en register 两 of 二 krijgen. 二 is normaal in 十二, 二十 en rangtelwoorden."]},"finalen":{"add":["un staat voor uen na bijvoorbeeld l (论 lùn), maar voor ün na j, q en x (军 jūn, 群 qún, 迅 xùn)."]},"pinyin-tekst":{"add":["Drie woorden worden door twee spaties gescheiden. Apostroffen markeren een nieuwe lettergreep die met a, o of e begint wanneer deze binnen hetzelfde woord volgt."]},"ja-nee-antwoorden":{"add":["是的 kan ook als algemene bevestiging van een bewering functioneren, en 对 bevestigt dat iets klopt. Bij een gewone werkwoordvraag is herhaling van het kernwerkwoord meestal de veiligste keuze."]},"taalvaardigheid":{"add":["听得懂 drukt uit dat verstaan mogelijk is; 听懂了 meldt dat het verstaan daadwerkelijk gelukt is."]},"duur":{"add":["Een duur na een werkwoord betekent niet noodzakelijk dat de activiteit gestopt is. De context en een eventuele zinsfinale 了 helpen bepalen of ze nog doorgaat."]},"voor-na-wanneer":{"add":["以后 vóór een werkwoord kan op zichzelf later betekenen, zoals 以后再说. Na een gebeurtenis geeft het de volgorde ten opzichte van die gebeurtenis aan."]},"werkwoordreduplicatie":{"add":["De tweede lettergreep van 讨论 is in de standaardwoordenboekvorm lùn: tǎolùn. In een herhaalde vorm kan de uitspraak lichter worden; leer eerst de basisvorm."]},"verandering-cheng":{"add":["成 chéng heeft hier de betekenis van worden of een resultaat bereiken; de woordenboekbetekenis één tiende is in deze constructie niet van toepassing."]},"vervoer-samen":{"add":["同行 betekent samen reizen met de uitspraak tóngxíng. Tóngháng betekent hetzelfde beroep uitoefenen of een vakgenoot; dit is een andere lezing."]},"sport-scores":{"add":["Een score is getal + 比 + getal, bijvoorbeeld 三比二. De namen van de teams kunnen afzonderlijk worden genoemd."]},"onbepaald":{"add":["Vergelijk 我什么都不吃 (ik eet helemaal niets) en 我不是什么都吃 (ik eet niet zomaar alles). De plaats van de ontkenning bepaalt het bereik."]}};

export function enrichArticle(article: Article): Article {
  const notes = enrichment[article.id];
  if (!notes) return article;

  // Analyses worden per voorbeeldzin in de brondata geschreven. Een automatische
  // koppeling op volgnummer gaf vaak een analyse die niet bij de zin hoorde.
  return {
    ...article,
    explanation: [...article.explanation, ...(editorialAdditions[article.id]?.add ?? [])],
    exercises: [...(conceptQuestions[article.id] ?? []).map(([question, options, answer, explanation]) => ({ question, options, answer, explanation })), ...(article.exercises ?? [])],
    minutes: Math.max(article.minutes, 15),
    examples: article.examples.map((item) => ({
      ...item,
      analysis: item.analysis ?? exampleAnalyses[`${article.id}|${item.chinese}`],
    })),
    deepDive: [notes[0], ...(article.deepDive || [])],
    pitfalls: [notes[1], ...(article.pitfalls || [])],
    practiceSteps: [notes[2], ...(article.practiceSteps || [])],
  };
}

export function missingArticleEnrichments(articles: Article[]) {
  return articles.filter((article) => !enrichment[article.id]).map((article) => article.id);
}
