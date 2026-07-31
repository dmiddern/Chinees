import type { Article } from "./articles";

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
    "Schrijf ní hǎo of bú shì niet als vaste woordenboekvormen. De basisvormen blijven nǐ en bù, ook wanneer hun werkelijke uitspraak door de omgeving verandert.",
    "Markeer in een korte zin eerst alle woordenboektonen en spreek haar daarna opnieuw uit met de toepasselijke toonveranderingen.",
  ],
  basiszinsvolgorde: [
    "Chinese woordvolgorde organiseert informatie van context naar kernhandeling. Tijd en plaats staan daarom vaak vroeg, terwijl resultaat, richting en hoeveelheid na het werkwoord kunnen komen. Het is een informatiestructuur, geen star invulschema.",
    "Plaats een tijdsbepaling niet automatisch aan het einde omdat dat in het Nederlands natuurlijk klinkt. Bij neutrale zinnen staat ze meestal vóór de handeling.",
    "Bouw vijf zinnen telkens in lagen: onderwerp, tijd, plaats, manier en pas daarna werkwoord plus voorwerp.",
  ],
  shi: [
    "是 koppelt vooral twee nominale eenheden of benadrukt een identificatie. Het Nederlands gebruikt zijn veel ruimer voor toestand, plaats en bestaan; het Chinees kiest daarvoor adjectieven, 在, 有 of andere werkwoorden.",
    "Zeg niet 他是很忙 voor het neutrale hij is druk. 很 is hier de normale koppeling tussen onderwerp en eigenschap, zonder noodzakelijk heel te betekenen.",
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
    "Gebruik bij een neutrale 比-vergelijking doorgaans geen 很 vóór het adjectief. Wil je een groot verschil tonen, gebruik dan veel duidelijker materiaal zoals 得多.",
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
    "Neem één werkwoord en beschrijf ermee snelheid, kwaliteit en frequentie via drie verschillende 得-complementen.",
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
    "Maak niet elke Nederlandse passiefzin mechanisch met 被. Chinees laat het onderwerp vaak gewoon weg wanneer de uitvoerder niet belangrijk is.",
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
    "Chinees antwoordt meestal door het werkwoord of adjectief van de vraag te herhalen of te ontkennen. 是 en 不是 werken alleen wanneer de vraag zelf om identiteit of bevestiging met 是 draait.",
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
    "Gebruik 到 niet voor elk vertrek en aankomen. 到达 is aankomen, 出发 vertrekken en 起飞 specifiek opstijgen.",
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
    "学习 is het algemene proces van leren; 学 kan een vak of vaardigheid nemen; 上课 is les volgen en 复习 is herhalen. 成绩, 作业 en 考试 beschrijven verschillende onderwijsresultaten en taken.",
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
    "Plaats 以前 niet zomaar vóór het werkwoord wanneer je na een gebeurtenis bedoelt. De positie bepaalt waarop de tijdsrelatie betrekking heeft.",
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
    "Verwar 好看 met 合适. Het eerste beoordeelt uiterlijk; het tweede of iets geschikt is of past.",
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
    "Vertaal 什么都不 en 不什么 mechanisch noch gelijk. De plaats van negatie bepaalt waarop de ontkenning slaat.",
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
    "Vertaal uncle, aunt, neef en nicht niet zonder de precieze familierelatie te kennen. Eén Nederlands woord kan meerdere Chinese termen hebben.",
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

const secondaryPitfall: Record<Article["kind"], string> = {
  Uitspraak: "Beoordeel dit onderwerp op hoorbaar contrast, niet alleen op de vraag of je de pinyinletters kunt lezen.",
  Schrift: "Leer de vorm niet als een los plaatje: verbind componenten, uitspraak, betekenis en schrijfbeweging.",
  Grammatica: "Een Nederlandse vertaling is geen volledige gebruiksregel. Controleer steeds positie, context en wat de spreker wil benadrukken.",
  Praktijk: "Leer geen geïsoleerde standaardzin zonder ook de mogelijke reactie en een manier om misverstanden te herstellen.",
};

export function enrichArticle(article: Article): Article {
  const notes = enrichment[article.id];
  if (!notes) return article;

  const analysedExamples = article.examples.map((item, index) => {
    const pattern = article.patterns[index % article.patterns.length];
    return {
      ...item,
      analysis: pattern
        ? `Structuur: ${pattern.formula}. ${pattern.meaning}`
        : "Lees de zin als één betekenisgroep en vergelijk de woordvolgorde met het Nederlands.",
    };
  });

  const patternNames = article.patterns.slice(0, 3).map((item) => `“${item.formula}”`).join(", ");
  return {
    ...article,
    minutes: Math.max(article.minutes, 15),
    examples: analysedExamples,
    deepDive: [
      notes[0],
      `Bestudeer ${patternNames} niet als losse formules. Vergelijk wat vooraan staat, wat de kernhandeling of beschrijving vormt en welke informatie pas achteraan wordt toegevoegd. Zo herken je wanneer een patroon natuurlijk is en wanneer een ogenschijnlijk letterlijke vertaling een andere Chinese constructie nodig heeft.`,
    ],
    pitfalls: [notes[1], secondaryPitfall[article.kind]],
    practiceSteps: [
      notes[2],
      `Zeg de ${article.examples.length} voorbeeldzinnen hardop, dek daarna pinyin en vertaling af en leg bij elke zin in je eigen woorden uit waarom de volgorde klopt.`,
      "Maak ten slotte één eigen voorbeeld dat inhoudelijk bij jouw dagelijks leven past. Controleer daarna elk onderdeel opnieuw aan de hand van de patronen hierboven.",
    ],
  };
}

export function missingArticleEnrichments(articles: Article[]) {
  return articles.filter((article) => !enrichment[article.id]).map((article) => article.id);
}
