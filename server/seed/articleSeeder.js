require("dotenv").config();
const mongoose = require("mongoose");
const { Article } = require("../models/Article");
const { Exercise } = require("../models/Exercise");
const ArticleTag = require("../enums/ArticleTag.enum");

const articles = [
  {
    title: "Važnost VO2max u utrkama na srednje i duge pruge",
    summary:
      "U ovom članku obrađujemo koncept maksimalnog primitka kisika (VO2max) i njegov utjecaj na sportske performanse.",
    content:
      '<h2>Što je VO2max i zašto je važan?</h2><p><strong>Maksimalni primitak kisika (VO2max)</strong> označava najveću količinu kisika koju tijelo može iskoristiti tijekom intenzivne tjelovježbe. Mjeri se u mililitrima kisika po kilogramu tjelesne mase u minuti (ml/kg/min) i smatra se jednim od najpouzdanijih pokazatelja aerobnog kapaciteta sportaša.</p><p>Elitni trkači na srednje i duge pruge često imaju VO2max vrijednosti između 70 i 85 ml/kg/min, dok rekreativni trkači obično postižu vrijednosti od 40 do 55 ml/kg/min. Iako je gornja granica VO2max-a dijelom genetski određena, trening može značajno povećati tu vrijednost – osobito u prvim godinama sustavnog vježbanja.</p><h2>Fiziološke osnove VO2max-a</h2><p>VO2max ovisi o sposobnosti srca da pumpa kisikom bogatu krv do radnih mišića (srčani minutni volumen), o sposobnosti mišića da izvuku kisik iz krvi (arteriovenska razlika kisika) i o efikasnosti dišnog sustava. Srčani udarni volumen – koliko krvi srce izbaci u jednom otkucaju – jedan je od ključnih faktora koji razlikuju elitne od prosječnih sportaša.</p><h2>vVO2max: brzina koja mijenja igru</h2><p>Znanstvena istraživanja, poput onih koje je provela Véronique Billat, uvela su koncept <strong>vVO2max</strong> – brzine trčanja pri kojoj se doseže VO2max. Billat je pokazala da je ukupno vrijeme provedeno na vVO2max (tzv. tlimit) ključni prediktor performansi na utrkama od 1500m do 5000m.</p><p>Njezin pionirski protokol – intervalni treninzi na vVO2max s omjerom rada i odmora 1:1 (npr. 30 sekundi trčanja, 30 sekundi odmora) – pokazao se iznimno učinkovitim u povećanju aerobnog kapaciteta. Treninzi poput 5×1000m s kratkim odmorima od 2-3 minute učinkovito stimuliraju kardiovaskularni sustav da radi bliže svom maksimumu.</p><h2>Utjecaj na utrke na 800m i 1500m</h2><p>Za trkače na 800m, aerobni sustav osigurava oko 60–70% ukupne energije, dok ostatak dolazi iz anaerobnih izvora. Na 1500m taj omjer raste na 80–85% u korist aerobnog sustava. Visok VO2max omogućuje trkačima da održe viši tempo bez prekomjernog nakupljanja laktata, čime čuvaju anaerobne rezerve za presudne trenutke utrke – ubrzanje u sredini ili eksplozivni finiš.</p><h2>Kako trenirati za povećanje VO2max-a</h2><p>Preporučuje se nekoliko strategija:</p><ul><li><p><strong>Intervalni treninzi na 90–100% vVO2max</strong>: kratki do srednje dugi intervali (400m–1200m) s odmorom koji nije potpun.</p></li><li><p><strong>Dugi lagani treninzi (LSD)</strong>: povećavaju srčani udarni volumen i gustoću mitohondrija u mišićima, čime se stvara aerobna baza.</p></li><li><p><strong>Tempo trčanje</strong>: kontinuirano trčanje od 20–40 minuta na 83–88% maksimalnog pulsa poboljšava ekonomičnost i pomiče laktatni prag prema gore.</p></li><li><p><strong>Progresivni treninzi (Progressive runs)</strong>: trčanje koje postupno ubrzava prema kraju treninga priprema tijelo na napor specifičan za utrku.</p></li></ul><p>Važno je napomenuti da previše visokointenzivnog rada bez dovoljnog oporavka vodi u pretreniranost, što može privremeno sniziti VO2max i povećati rizik od ozljede. Preporučeni omjer je 80% laganog i 20% visokog intenziteta (tzv. „80/20 pravilo").</p><h2>Mjerenje i praćenje napretka</h2><p>VO2max se može izmjeriti laboratorijski (spiroergometrija) ili procijeniti terenskim testovima poput Cooperovog testa (12-minutno trčanje) ili Beep testa. Moderni GPS satovi i pametni sportski dodaci sve preciznije procjenjuju VO2max na temelju srčane frekvencije i brzine trčanja, što trkačima omogućuje praćenje napretka bez skupih laboratorijskih testova.</p><h2>Zaključak</h2><p>VO2max je temelj aerobne kondicije svakog trkača. Razumijevanjem fiziologije iza te mjere i primjenom odgovarajućih metoda treninga moguće je sustavno podizati aerobni kapacitet i postizati bolje rezultate na prugama od 800m do maratona.</p>',
    tag: ArticleTag.PHYSIOLOGY,
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/11474336/",
    sourceTitle:
      "Interval training at VO2max: effects on aerobic performance and overtraining markers",
    coverImage:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
    author: "Atletikum Edukacija",
    quiz: [
      {
        question: "Što označava VO2max?",
        options: [
          "Maksimalnu brzinu koju trkač može postići",
          "Najveću količinu kisika koju tijelo može iskoristiti",
          "Maksimalan broj otkucaja srca",
        ],
        correctIndex: 1,
      },
      {
        question:
          "Koji tip treninga je vrlo učinkovit za podizanje VO2max prema istraživanjima?",
        options: [
          "Dugi lagani treninzi",
          "Samo treninzi snage u teretani",
          "Intervalni treninzi na 90-100% vVO2max",
        ],
        correctIndex: 2,
      },
      {
        question:
          "Koji energetski sustav osigurava većinu energije za utrke na 1500m?",
        options: [
          "Samo anaerobni sustav",
          "Aerobni sustav",
          "Kreatin fosfatni sustav",
        ],
        correctIndex: 1,
      },
      {
        question: "Što je vVO2max?",
        options: [
          "Maksimalna srčana frekvencija pri utrci",
          "Brzina trčanja pri kojoj se doseže VO2max",
          "Volumen kisika pohranjen u mišićima",
        ],
        correctIndex: 1,
      },
      {
        question: "Koji omjer intenziteta treninga preporučuje '80/20 pravilo'?",
        options: [
          "80% visokog intenziteta, 20% laganog",
          "80% laganog intenziteta, 20% visokog",
          "Jednaka raspodjela visokog i laganog intenziteta",
        ],
        correctIndex: 1,
      },
      {
        question: "Koji od navedenih faktora NIJE ključan za visok VO2max?",
        options: [
          "Srčani udarni volumen",
          "Arteriovenska razlika kisika",
          "Duljina stopala trkača",
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    title: "Laktatni prag i njegov utjecaj na izdržljivost",
    summary:
      "Saznajte kako odgoditi nakupljanje mliječne kiseline i trčati brže na duljim distancama.",
    content:
      '<h2>Što je laktat i zašto se nakuplja?</h2><p>Laktat (često netočno nazivan „mliječna kiselina") nastaje kao nusprodukt razgradnje glukoze u uvjetima nedovoljne opskrbe kisikom. Tijelo ga neprestano proizvodi i uklanja čak i u mirovanju. Problem nastaje kada intenzitet vježbanja poraste do točke na kojoj produkcija laktata premašuje sposobnost tijela da ga metabolizira – ta točka poznata je kao <strong>laktatni prag (LP)</strong>.</p><h2>Fiziologija laktatnog praga</h2><p>Istraživanje Farrella i sur. iz 1979. pokazalo je snažnu korelaciju između razine laktata u krvi i trkačkih rezultata u utrkama izdržljivosti. Laktatni prag obično se definira kao intenzitet pri kojemu koncentracija laktata u krvi dostiže 4 mmol/L (tzv. OBLA – Onset of Blood Lactate Accumulation), mada postoje i druge definicije.</p><p>Kod netreniranih osoba, LP se javlja na oko 50–60% VO2max-a. Kod dobro treniranih trkača, LP može biti i na 85–90% VO2max-a. To znači da elitni trkači mogu trčati znatno brže prije nego što se laktat počne nekontrolirano nakupljati.</p><h2>Dva praga: aerobni i anaerobni</h2><p>Moderna sportska fiziologija razlikuje dva praga:</p><ul><li><p><strong>Aerobni prag (VT1/AeT)</strong>: blagi porast laktata iznad bazalne razine; intenzitet razgovora još je moguć. Kod većine trkača to je na 65–75% maksimalnog pulsa.</p></li><li><p><strong>Anaerobni prag (VT2/AnT)</strong>: točka naglog ubrzanja nakupljanja laktata; razgovor postaje nemoguć. Ovaj prag je ključan za performansu na utrkama od 10 km do polumaratona.</p></li></ul><p>Za trkače na 800m i 1500m, sposobnost trčanja blizu anaerobnog praga bez prekomjernog zakiseljavanja direktno utječe na to koliko dugo mogu zadržati natjecateljski tempo.</p><h2>Kako trening pomiče laktatni prag</h2><p>Postoje tri glavne metode treniranja laktatnog praga:</p><h3>1. Tempo trčanje (Continuous Threshold)</h3><p>Kontinuirano trčanje od 20 do 40 minuta na tempu koji odgovara laktatnom pragu – obično „udobno teško" (možete reći jednu kratku rečenicu, ali ne voditi razgovor). Istraživanja pokazuju da ovaj trening potiče mitohondrijske adaptacije koje povećavaju sposobnost mišića da oksidiraju laktat.</p><h3>2. Laktatni intervali (Cruise Intervals)</h3><p>Kraći intervali (npr. 4×2000m) na tempu laktatnog praga s kratkim odmorima od 1 minute. Ova metoda omogućuje veći ukupni volumen rada na pragu uz manji akumulirani zamor.</p><h3>3. Progresivni treninzi</h3><p>Trčanje koje počinje ispod praga i postupno ubrzava do iznad praga. Ova metoda poboljšava sposobnost tijela da se prilagodi promjenama tempa – posebno korisno za trkače koji preferiraju negativni split (brža druga polovica utrke).</p><h2>Laktat kao gorivo, ne otpad</h2><p>Važno je razumjeti da laktat nije isključivo „štetni otpad" nego je zapravo gorivo koje mogu koristiti srce, sporo trzajna mišićna vlakna i jetra. Trening povećava sposobnost mišića da recikliraju laktat – tzv. <strong>laktatni čistač (lactate shuttle)</strong>. Trkači s boljom sposobnosti recikliranja laktata mogu trčati dulje na višem intenzitetu.</p><h2>Praktični savjeti za trkače</h2><ul><li><p>Uključite jedan do dva tempo treninga tjedno u plan, ne više.</p></li><li><p>Pratite puls ili koristite GPS tempo za zadržavanje odgovarajućeg intenziteta.</p></li><li><p>Progresivno povećavajte trajanje tempo trčanja (počnite s 20, gradite prema 40 minuta).</p></li><li><p>Kombinacija tempo treninga i intervalnog rada na VO2max daje sinergijski efekt na laktatni prag.</p></li></ul><h2>Zaključak</h2><p>Laktatni prag je jedan od najvažnijih prediktora rezultata u utrkama izdržljivosti – čak i važniji od samog VO2max-a kod iskusnih trkača. Sustavnim treningom u zoni praga moguće je značajno podignuti brzinu pri kojoj se laktat počinje nakupljati, što izravno znači brže utrke uz isti napor.</p>',
    tag: ArticleTag.PHYSIOLOGY,
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/461756/",
    sourceTitle: "Plasma lactate accumulation and distance running performance",
    coverImage:
      "https://images.unsplash.com/photo-1536922246289-88c42f95e61a?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
    author: "Atletikum Edukacija",
    quiz: [
      {
        question: "Što definira laktatni prag?",
        options: [
          "Trenutak kada se laktat počinje nakupljati u krvi brže nego što se uklanja",
          "Trenutak kad tijelo ostane bez zaliha glikogena",
          "Maksimalna sposobnost korištenja kisika",
        ],
        correctIndex: 0,
      },
      {
        question: "Kakav trening primarno pomaže u pomicanju laktatnog praga?",
        options: [
          "Sprintevi od 50 metara",
          "Tempo trčanje u zoni praga",
          "Trčanje nizbrdo",
        ],
        correctIndex: 1,
      },
      {
        question:
          "Na kojoj razini VO2max-a se laktatni prag obično javlja kod dobro treniranih trkača?",
        options: [
          "Na 50–60% VO2max-a",
          "Na 85–90% VO2max-a",
          "Uvijek na 100% VO2max-a",
        ],
        correctIndex: 1,
      },
      {
        question:
          "Koji je standardni pokazatelj OBLA (Onset of Blood Lactate Accumulation)?",
        options: [
          "2 mmol/L laktata u krvi",
          "4 mmol/L laktata u krvi",
          "8 mmol/L laktata u krvi",
        ],
        correctIndex: 1,
      },
      {
        question: "Što je 'laktatni čistač' (lactate shuttle)?",
        options: [
          "Sustav za mjerenje laktata u laboratoriju",
          "Sposobnost mišića i organa da recikliraju laktat kao gorivo",
          "Naziv za tempo trening u atletici",
        ],
        correctIndex: 1,
      },
      {
        question:
          "Koji od navedenih opisa odgovara aerobnom pragu (VT1)?",
        options: [
          "Intenzitet pri kojemu razgovor postaje nemoguć",
          "Blagi porast laktata; razgovor je još moguć",
          "Maksimalni intenzitet koji trkač može izdržati 10 sekundi",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "Biomehanika trčanja i ekonomičnost",
    summary:
      "Zašto nije važno samo koliko kisika možete primiti, nego i kako učinkovito ga trošite kroz pravilnu formu.",
    content:
      '<h2>Ekonomičnost trčanja: što je i zašto je bitna?</h2><p><strong>Ekonomičnost trčanja (Running Economy – RE)</strong> definira se kao potrošnja kisika pri određenoj sub-maksimalnoj brzini trčanja. Trkači s boljom ekonomičnošću troše manje kisika za isti tempo, što im ostavlja više aerobnog kapaciteta za natjecateljske napore. Istraživanja su pokazala da dva trkača s identičnim VO2max-om mogu imati razliku u rezultatima od 10–15% isključivo zbog razlike u ekonomičnosti trčanja.</p><h2>Ključni biomehanički faktori</h2><h3>1. Kontakt s podlogom (Ground Contact Time – GCT)</h3><p>Kraće vrijeme kontakta stopala s podlogom direktno je povezano s boljom ekonomičnošću. Elitni sprinteri imaju GCT ispod 100 ms, dok trkači na duge pruge ciljaju prema 160–200 ms. Vježbe poput pogo skokova i A-skokova pomažu smanjiti GCT treniranjem brzog odraza.</p><h3>2. Vertikalna oscilacija</h3><p>Prekomjerno vertikalno kretanje (skakanje gore-dolje) troši energiju koja se ne pretvara u horizontalno napredovanje. Optimalna vertikalna oscilacija za trkače na srednje pruge je oko 6–9 cm. Visoka kadenca (broj koraka u minuti) smanjuje vertikalnu oscilaciju – preporučuje se ciljati prema 170–180 koraka u minuti.</p><h3>3. Kadenca (Stride Rate)</h3><p>Kadenca je broj koraka u minuti. Istraživanje Hasegawe et al. (2007) pokazalo je da trkači koji slijeću sa stopalom ispod centra mase (tzv. midfoot ili forefoot udar) imaju bolju ekonomičnost od onih koji udare petom daleko ispred tijela (overstriding). Povećanje kadence za 5–10% može značajno smanjiti sile udara i poboljšati ekonomičnost.</p><h3>4. Krutost tetiva i povrat elastične energije</h3><p>Ahilova tetiva i fascija plantar funkcioniraju kao opruge – pohranjuju energiju pri kontaktu s podlogom i oslobađaju je pri odrazu. Istraživanje Saundersa i sur. (2004) pokazalo je da plyometrijski treninzi i treninzi snage povećavaju krutost tetiva, čime poboljšavaju sposobnost pohrane i povrata elastične energije. To smanjuje metabolički trošak trčanja bez promjene VO2max-a.</p><h3>5. Položaj trupa i rad ruku</h3><p>Uspravno držanje trupa olakšava disanje i omogućuje pravilnu rotaciju tijela. Rad ruku treba biti kompaktan – laktovi savijeni na oko 90°, ruke se kreću naprijed-natrag (ne bočno), a šake su opuštene. Prekomjerna rotacija ramena i trupa troši energiju i usporava trkača.</p><h2>Trening za poboljšanje ekonomičnosti</h2><h3>Trkački ABC</h3><p>Vježbe poput A-skokova, B-skokova i preskoka s visokim koljenima (high knees) ciljano treniraju neuromišićne obrasce koji poboljšavaju tehniku trčanja. Ove se vježbe izvode kao dio zagrijavanja ili zasebnih tehničkih treninga, 2–3 puta tjedno.</p><h3>Snažni trening</h3><p>Studija Saundersa et al. pokazuje da 6 tjedana plyometrijskog treninga (skokovi, boksevi, preskoci prepreka) poboljšava RE za 3–4% bez promjene tjelesne mase. Vježbe poput romanijskog mrtvog dizanja, hip thrust i iskoraka grade snagu mišića koji direktno sudjeluju u propulziji pri trčanju.</p><h3>Trčanje boso ili u minimalističkim tenisicama</h3><p>Kraći periodi trčanja boso ili u lakim cipelama s niskim potplatom aktiviraju stabilizatore stopala i poboljšavaju propriocepciju. Uvođenje treba biti postepeno kako bi se izbjegle ozljede Ahilove tetive.</p><h2>Mjerenje ekonomičnosti trčanja</h2><p>Ekonomičnost trčanja mjeri se u laboratoriju uz pomoć analitičara plinova koji mjere potrošnju kisika (VO2) pri konstantnoj brzini trčanja na pokretnoj traci. U terenskim uvjetima, GPS satovi s mjerenjem srčane frekvencije mogu dati okvirnu procjenu, ali su laboratorijske metode znatno preciznije.</p><h2>Zaključak</h2><p>Ekonomičnost trčanja je sposobnost koja se može razvijati treningom – nije isključivo genetski zadana. Kombinacijom tehničkih vježbi (ABC), plyometrijskog treninga i rada na snazi moguće je značajno smanjiti energetski trošak trčanja pri natjecateljskim brzinama. Za trkače koji su dostigli plafon VO2max-a, poboljšanje ekonomičnosti često je ključ za proboj prema osobnim rekordima.</p>',
    tag: ArticleTag.BIOMECHANICS,
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/15233599/",
    sourceTitle:
      "Factors affecting running economy in trained distance runners",
    coverImage:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=2938&ixlib=rb-4.0.3",
    author: "Atletikum Edukacija",
    quiz: [
      {
        question: "Što je ekonomičnost trčanja?",
        options: [
          "Mogućnost kupnje jeftinije opreme za trčanje",
          "Potrošnja kisika pri određenoj sub-maksimalnoj brzini trčanja",
          "Vrijeme potrebno za oporavak od utrke",
        ],
        correctIndex: 1,
      },
      {
        question:
          "Koji od navedenih faktora POMAŽE dobroj ekonomičnosti trčanja?",
        options: [
          "Velika vertikalna oscilacija (puno skakanja u zrak)",
          "Dugi kontakt noge s podlogom",
          "Optimalan povrat elastične energije tetiva",
        ],
        correctIndex: 2,
      },
      {
        question: "Kako se naziva trening skokova koji pomaže tetivama?",
        options: [
          "Pliometrijski trening",
          "Izometrijski trening",
          "Statičko istezanje",
        ],
        correctIndex: 0,
      },
      {
        question:
          "Koja je preporučena kadenca (broj koraka u minuti) za trkače na srednje i duge pruge?",
        options: [
          "120–140 koraka u minuti",
          "170–180 koraka u minuti",
          "200–220 koraka u minuti",
        ],
        correctIndex: 1,
      },
      {
        question: "Što je GCT (Ground Contact Time)?",
        options: [
          "Ukupno trajanje treninga na tartanskoj stazi",
          "Vrijeme kontakta stopala s podlogom pri svakom koraku",
          "Brzina trkača mjerena GPS-om",
        ],
        correctIndex: 1,
      },
      {
        question:
          "Koji položaj laktova se preporučuje za učinkovit rad ruku pri trčanju?",
        options: [
          "Laktovi savijeni na oko 90°",
          "Laktovi potpuno ispruženi",
          "Laktovi savijeni na oko 150°",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    title: "Prehrana i unos ugljikohidrata prije utrke",
    summary:
      "Strukturirano punjenje glikogenskih zaliha ključ je za sprječavanje prijevremenog umora.",
    content:
      '<h2>Zašto su ugljikohidrati ključni za trkače?</h2><p>Ugljikohidrati su primarno gorivo za tjelesnu aktivnost visokog intenziteta. Pohranjuju se u obliku <strong>glikogena</strong> u mišićima (oko 400–500 grama) i jetri (oko 100 grama). Za razliku od masti, glikogen se metabolizira brzo i učinkovito, što ga čini nezamjenjivim izvorom energije u utrkama intenziteta iznad 70–75% VO2max-a – dakle, u svim natjecanjima od 800m do maratona.</p><p>Kad se glikogenske zalihe isprazne, trkač doživljava tzv. „udar u zid" (bonking) – dramatičan pad performanse koji nije moguće prevladati voljom. Preventivno punjenje glikogena ključan je alat za svaki ozbiljan nastup.</p><h2>Carb loading: što kaže znanost?</h2><p>Istraživanje Burkea i sur. (2011) o prehrani sportaša pokazalo je da konzumacija <strong>8–10 grama ugljikohidrata po kilogramu tjelesne mase</strong> u posljednja 24–36 sati prije natjecanja maksimizira glikogenske zalihe. Za sportaša od 70 kg to znači 560–700 grama ugljikohidrata – što je znatno više od uobičajene dnevne potrošnje.</p><p>Važno je naglasiti da klasični carb loading (koji podrazumijeva i fazu deplecije glikogena tjedan dana ranije) nije potreban za utrke kraće od 90 minuta. Za trkače na 800m i 1500m dovoljno je u posljednja 24 sata povećati udio ugljikohidrata u prehrani uz smanjenje unosa vlakana, masti i bjelančevina.</p><h2>Vremenski plan prehrane prije utrke</h2><h3>2–3 dana prije</h3><p>Postupno povećavajte udio ugljikohidrata na 60–70% ukupnih kalorija. Žitarice, riža, tjestenina, kruh i voće odlični su izvori. Izbjegavajte novu hranu ili eksperimentiranje s egzotičnim namirnicama.</p><h3>Dan prije utrke</h3><p>Konzumirajte laganu do umjerenu večeru bogatu ugljikohidratima (npr. tjestenina s maslinovim uljem i piletinom) i pobrinite se za dovoljan unos tekućine. Izbjegavajte alkohol i hranu bogatu vlaknima koja može izazvati probavne smetnje.</p><h3>3–4 sata prije utrke</h3><p>Obrok treba sadržavati 1–2 grama ugljikohidrata po kilogramu tjelesne mase. Primjeri: zobene pahuljice s bananom i medom, bijeli kruh s džemom i jogurtom. Hrana treba biti niskosadržajna u vlaknima i mastima kako bi se probava završila do polaska na zagrijavanje.</p><h3>30–60 minuta prije utrke</h3><p>Mali obrok ili grickalica s brzo probavljivim ugljikohidratima (banana, energetski gel, sportski napitak). Izbjegavajte hranu bogatu proteinima ili mastima u ovom periodu jer usporavaju pražnjenje želuca.</p><h3>Neposredno prije (&lt; 15 minuta)</h3><p>Mali gutljaj sportskog napitka ili gel može dati kratkotrajan porast glukoze u krvi. Međutim, kod nekih sportaša to može izazvati reaktivnu hipoglikemiju – kratkotrajan pad šećera u krvi koji se manifestira slaboćom. Testirajte ovo na treninzima, ne na utrci.</p><h2>Hidratacija</h2><p>Dehidracija od samo 2% tjelesne mase može smanjiti performanse za 5–8%. Počnite dan utrke dobro hidrirani (urin boje limunade), konzumirajte 400–600 ml tekućine 2–3 sata prije utrke i dodatnih 150–250 ml neposredno prije.</p><h2>Posebnosti za trkače na 800m i 1500m</h2><p>Za utrke ispod 5 minuta (800m) ili ispod 4 minute (1500m), glikogenske zalihe gotovo nikad nisu limitirajući faktor – trajanje je prekratko za potpuno iscrpljenje. Međutim:</p><ul><li><p>Optimalne glikogenske zalihe štite mišiće od preranog zakiseljavanja.</p></li><li><p>Dobar obrok smanjuje psihološku anksioznost i daje osjećaj spremnosti.</p></li><li><p>Trkači koji se natječu u više disciplina istog dana (npr. eliminacije i finale) moraju pažljivo planirati nadopunu energije između nastupa.</p></li></ul><h2>Zaključak</h2><p>Prehrana nije samo pozadinska logistika – ona je sastavni dio trenažnog procesa. Razumijevanjem kako i kada konzumirati ugljikohidrate moguće je optimizirati glikogenske zalihe, smanjiti zamor i omogućiti tijelu da na dan utrke pruži maksimum koji je trening stvorio.</p>',
    tag: ArticleTag.NUTRITION,
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/22020297/",
    sourceTitle: "Carbohydrates for training and competition",
    coverImage:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=2906&ixlib=rb-4.0.3",
    author: "Atletikum Edukacija",
    quiz: [
      {
        question:
          "Koji je primarni izvor energije pohranjen u mišićima i jetri?",
        options: ["Aminokiseline", "Glikogen", "Bjelančevine"],
        correctIndex: 1,
      },
      {
        question:
          "Koju količinu ugljikohidrata predlažu smjernice za punjenje prije važnih utrka (po kg mase)?",
        options: ["1-2 grama", "4-5 grama", "8-10 grama"],
        correctIndex: 2,
      },
      {
        question:
          "Zašto je važno izbjegavati previše vlakana neposredno pred trčanje?",
        options: [
          "Jer usporavaju probavu i mogu izazvati želučane probleme",
          "Jer smanjuju snagu mišića",
          "Jer dehidriraju organizam",
        ],
        correctIndex: 0,
      },
      {
        question:
          "Što je 'udar u zid' (bonking) u kontekstu trčanja?",
        options: [
          "Sudar s drugim trkačem na stazi",
          "Dramatičan pad performanse uzrokovan iscrpljivanjem glikogenskih zaliha",
          "Bol u mišićima dan nakon utrke",
        ],
        correctIndex: 1,
      },
      {
        question:
          "Koliko tekućine se preporučuje konzumirati 2–3 sata prije utrke?",
        options: ["50–100 ml", "400–600 ml", "1–2 litre"],
        correctIndex: 1,
      },
      {
        question:
          "Koji od navedenih obroka je najprikladniji 3–4 sata prije utrke?",
        options: [
          "Pečena svinjetina s kupusom i maslacem",
          "Zobene pahuljice s bananom i medom",
          "Salata od leće s puno vlakana",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "Trening snage za trkače (Eksplozivnost i prevencija ozljeda)",
    summary:
      "Zašto atletičari moraju dizati utege te kako to utječe na prevenciju ozljeda i snagu u finišu utrke.",
    content:
      '<h2>Mit o trkačima i tegovima</h2><p>Dugo je postojala zabluda da će trening snage učiniti trkače sporima, preteškim ili sklonima ozljedama. Moderan znanstveni konsenzus stoji upravo suprotno: dobro planiran trening snage poboljšava i rezultate i zdravlje trkača. Razumijevanje zašto – i kako pravilno to implementirati – ključno je za svaki ozbiljni trenažni plan.</p><h2>Što kaže istraživanje?</h2><p>Studija Rønnestada i Mujike (2014) analizirala je 26 randomiziranih kontroliranih istraživanja o kombiniranom treningu snage i izdržljivosti. Zaključak je jasan: <strong>teški treninzi snage s malim brojem ponavljanja i velikom kilažom (3–5 serija × 3–6 ponavljanja, 80–90% 1RM) znatno povećavaju maksimalnu silu mišića nogu bez značajnog povećanja mišićne mase (hipertrofije)</strong>.</p><p>Ovo je ključna distinkcija: trkači ne trebaju bodybuilderski trening usmjeren na hipertrofiju, nego neuromišićni trening usmjeren na <strong>maksimalnu silu i brzinu aktivacije mišićnih vlakana (Rate of Force Development – RFD)</strong>.</p><h2>Kako snaga poboljšava trkačke performanse?</h2><h3>1. Ekonomičnost trčanja</h3><p>Jači mišići nogu i tetive mogu pohraniti i osloboditi više elastične energije pri svakom koraku. Studija Hasegawe et al. pokazuje da se ekonomičnost trčanja poboljšava za 3–8% nakon 6–12 tjedana snažnog treninga, čak i bez promjene VO2max-a.</p><h3>2. Eksplozivnost i finiš</h3><p>U finišu utrke na 800m ili 1500m, trkači s boljom neuromišićnom snagom mogu zadržati ili povećati kadencu kad su mišići umorni. Eksplozivnost (sposobnost brze produkcije sile) direktno utječe na sposobnost ubrzanja u posljednjih 200m.</p><h3>3. Prevencija ozljeda</h3><p>Najčešće kronične ozljede trkača – trkačko koljeno (PFSS), trkačka potkoljenica (shin splints), stres frakture i tendinopatija Ahilove tetive – u korelaciji su s nedovoljnom snagom okolnih mišića. Jaki gluteusi, kvadricepsi i mišići potkoljenice smanjuju prekomjerno opterećenje kostiju i zglobova.</p><h2>Ključne vježbe za trkače</h2><h3>Donji dio tijela</h3><ul><li><p><strong>Stražnji čučanj (Back Squat)</strong>: kralj vježbi za snagu nogu. Jača kvadricepse, gluteuse i stabilizatore kuka. Tehnika je ključna – duboki čučanj aktivira gluteuse bolje od parcijalnog.</p></li><li><p><strong>Romanijsko mrtvo dizanje (Romanian Deadlift)</strong>: ciljano jača stražnju ložu i gluteuse – mišiće propulzije koji su kod trkača često slabiji od kvadricepsa. Pomaže korigirati mišićne neravnoteže.</p></li><li><p><strong>Iskoraci i bugarski čučanj (Split Squat)</strong>: unilateralne vježbe koje oponašaju jednožnu mehaniku trčanja i razvijaju ravnotežu i stabilnost kuka.</p></li><li><p><strong>Hip thrust</strong>: visoko specifična vježba za gluteus maximus – primarni mišić propulzije pri sprintu.</p></li></ul><h3>Eksplozivne vježbe</h3><ul><li><p><strong>Skokovi na kutiju (Box Jumps)</strong>: razvijaju reaktivnu snagu i uče živčani sustav brzoj aktivaciji mišićnih vlakana.</p></li><li><p><strong>Bounding i A-Skips</strong>: trkački specifične eksplozivne vježbe koje direktno prenose snagu u trkačku mehaniku.</p></li><li><p><strong>Medicinke bacanje</strong>: razvijaju snagu gornjeg dijela tijela i trupa, što poboljšava koordinaciju i smanjuje nepotrebne kretnje trupa pri trčanju.</p></li></ul><h3>Trup (Core)</h3><ul><li><p><strong>Plank, Side Plank, Dead Bug</strong>: stabilan trup je osnova učinkovitog prijenosa sile iz nogu prema naprijed. Trkači s nestabilnim trupom „cure" energiju kroz rotacijske kretnje koje ne pridonose napredovanju.</p></li><li><p><strong>Back Extensions i Bird Dog</strong>: jačaju lumbalnu regiju i stražnji lanac, koji su ključni za održavanje uspravnog držanja u drugoj polovici utrke kada nastupa umor.</p></li></ul><h2>Kako integrirati trening snage u plan?</h2><p>Optimalan raspored:</p><ul><li><p><strong>Početnički trkači</strong>: 2× tjedno, usmjereno na temeljne obrasce gibanja s umjerenim opterećenjem.</p></li><li><p><strong>Napredni trkači</strong>: 1–2× tjedno, s naglaskom na teške serije (visoka kilaža, mali broj ponavljanja) i eksplozivne vježbe.</p></li><li><p><strong>Pred-sezona</strong>: veći volumen snažnog treninga dok je volumen trčanja manji.</p></li><li><p><strong>Sezona natjecanja</strong>: reducirajte volumen i frekvenciju treninga snage, ali zadržite intenzitet (ne gubite adaptacije).</p></li></ul><p>Sesije snage best je smjestiti na isti dan kao i teže trkačke treninge (intervale), kako bi lagani dani ostali zaista lagani i oporavljajući.</p><h2>Zaključak</h2><p>Trening snage nije opcija za trkače – on je nužnost. Pravilno planiran, poboljšava ekonomičnost trčanja, eksplozivnost u finišu i otpornost na ozljede. Ključ je odabir pravih vježbi, odgovarajućeg opterećenja i pametna integracija u ukupni trenažni plan.</p>',
    tag: ArticleTag.TRAINING,
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/24057885/",
    sourceTitle:
      "Optimizing strength training for running and cycling endurance performance: A review",
    coverImage:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3",
    author: "Atletikum Edukacija",
    quiz: [
      {
        question: "Znanstveni pregled navodi da teški trening snage za trkače:",
        options: [
          "Poboljšava snagu bez nepotrebnog rasta mišićne mase ako se pravilno izvede",
          "Dovodi do opadanja izdržljivosti",
          "Ubrzava zakiseljavanje prilikom trčanja",
        ],
        correctIndex: 0,
      },
      {
        question: "Što od navedenog sprječava trening snage?",
        options: [
          "Brz metabolizam",
          "Česte, specifične ozljede (npr. trkačka potkoljenica)",
          "Duljinu koraka",
        ],
        correctIndex: 1,
      },
      {
        question: "Što je RFD (Rate of Force Development)?",
        options: [
          "Ukupna sila mišića izmjerena na dinamometru",
          "Brzina kojom mišići mogu producirati silu",
          "Omjer snage i tjelesne mase trkača",
        ],
        correctIndex: 1,
      },
      {
        question:
          "Koja vježba je najefikasnija za jačanje gluteus maximusa kod trkača?",
        options: ["Bench press", "Hip thrust", "Veslanje s utegom"],
        correctIndex: 1,
      },
      {
        question:
          "Kako bi trkači trebali rasporediti sesije snage u tjednom planu?",
        options: [
          "Uvijek na lagane dane za maksimalan odmor između intenzivnih treninga",
          "Na isti dan kao teži trkački treninzi, kako bi lagani dani bili zaista lagani",
          "Isključivo vikendom, neovisno o ostatku tjednog plana",
        ],
        correctIndex: 1,
      },
      {
        question:
          "Koliko ponavljanja i serija preporučuje istraživanje za neuromišićni trening snage trkača?",
        options: [
          "10–15 ponavljanja, 4–5 serija (hipertrofijski raspon)",
          "3–6 ponavljanja, 3–5 serija s visokom kilažom (80–90% 1RM)",
          "20+ ponavljanja, 2–3 serije s lakim opterećenjem",
        ],
        correctIndex: 1,
      },
    ],
  },
];

const articleRelations = {
  "Važnost VO2max u utrkama na srednje i duge pruge": {
    relatedArticleTitles: [
      "Laktatni prag i njegov utjecaj na izdržljivost",
      "Biomehanika trčanja i ekonomičnost",
    ],
    relatedExerciseTitles: ["Visoka koljena", "Bounding"],
  },
  "Laktatni prag i njegov utjecaj na izdržljivost": {
    relatedArticleTitles: [
      "Važnost VO2max u utrkama na srednje i duge pruge",
      "Prehrana i unos ugljikohidrata prije utrke",
    ],
    relatedExerciseTitles: ["Visoka koljena", "Udarci petom"],
  },
  "Biomehanika trčanja i ekonomičnost": {
    relatedArticleTitles: [
      "Trening snage za trkače (Eksplozivnost i prevencija ozljeda)",
      "Važnost VO2max u utrkama na srednje i duge pruge",
    ],
    relatedExerciseTitles: ["A-preskoci", "Vježba uz zid – izmjena nogu", "Pogo skokovi"],
  },
  "Prehrana i unos ugljikohidrata prije utrke": {
    relatedArticleTitles: [
      "Laktatni prag i njegov utjecaj na izdržljivost",
      "Važnost VO2max u utrkama na srednje i duge pruge",
    ],
    relatedExerciseTitles: ["Visoka koljena"],
  },
  "Trening snage za trkače (Eksplozivnost i prevencija ozljeda)": {
    relatedArticleTitles: [
      "Biomehanika trčanja i ekonomičnost",
      "Važnost VO2max u utrkama na srednje i duge pruge",
    ],
    relatedExerciseTitles: ["Rumunjsko mrtvo dizanje", "Iskoraci u hodu", "Skokovi na kutiju"],
  },
};

const applyArticleRelations = async (insertedArticles) => {
  if (!insertedArticles.length) {
    return;
  }

  const articlesByTitle = new Map(
    insertedArticles.map((article) => [article.title, article]),
  );
  const allExerciseTitles = [
    ...new Set(
      Object.values(articleRelations).flatMap(
        (relation) => relation.relatedExerciseTitles ?? [],
      ),
    ),
  ];
  const exerciseDocs = await Exercise.find({
    title: { $in: allExerciseTitles },
  })
    .select("_id title")
    .lean();
  const exerciseIdsByTitle = new Map(
    exerciseDocs.map((exercise) => [exercise.title, exercise._id]),
  );

  const operations = insertedArticles
    .map((article) => {
      const relation = articleRelations[article.title];
      if (!relation) {
        return null;
      }

      const relatedArticleIds = (relation.relatedArticleTitles ?? [])
        .map((title) => articlesByTitle.get(title)?._id)
        .filter(Boolean);
      const relatedExerciseIds = (relation.relatedExerciseTitles ?? [])
        .map((title) => exerciseIdsByTitle.get(title))
        .filter(Boolean);

      return {
        updateOne: {
          filter: { _id: article._id },
          update: {
            $set: {
              relatedArticleIds,
              relatedExerciseIds,
            },
          },
        },
      };
    })
    .filter(Boolean);

  if (operations.length > 0) {
    await Article.bulkWrite(operations);
  }
};

const importData = async () => {
  try {
    await Article.deleteMany();
    const insertedArticles = await Article.insertMany(articles);
    await applyArticleRelations(insertedArticles);
    console.log("Article seed imported successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error importing article seed:", err.message);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await Article.deleteMany();
    console.log("Article seed deleted successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error deleting article seed:", err.message);
    process.exit(1);
  }
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    if (process.argv.includes("--delete")) {
      await deleteData();
      return;
    }

    await importData();
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
};

run();
