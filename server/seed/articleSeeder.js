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
      "**Maksimalni primitak kisika (VO2max)** označava najveću količinu kisika koju tijelo može iskoristiti tijekom intenzivne tjelovježbe.\n\nZnanstvena istraživanja, poput onih koja je provela Véronique Billat, pokazuju da je vrijeme provedeno na vVO2max (brzina pri kojoj se doseže VO2max) ključno za poboljšanje trkačkih performansi na dugim i srednjim prugama. \n\nZa trkače na 800m i 1500m, VO2max igra veliku ulogu jer aerobni sustav osigurava većinu energije, dok anaerobni sustav doprinosi kratkim, intenzivnim promjenama tempa. Intervalni treninzi (npr. 5x1000m s kratkim odmorima) učinkovito podižu prag VO2max. \n\nPreporučuje se treniranje na 90-100% vVO2max za optimalan podražaj kardiovaskularnog sustava.",
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
    ],
  },
  {
    title: "Laktatni prag i njegov utjecaj na izdržljivost",
    summary:
      "Saznajte kako odgoditi nakupljanje mliječne kiseline i trčati brže na duljim distancama.",
    content:
      "Laktatni prag je intenzitet vježbanja na kojem se laktat (mliječna kiselina) počinje ubrzano nakupljati u krvi brže nego što ga tijelo može ukloniti. \n\nIstraživanje (Farrell et al., 1979) je dokazalo usku povezanost između laktatnog praga i rezultata u utrkama izdržljivosti. Kod elitnih atletičara, nakupljanje laktata događa se pri znatno bržem tempu trčanja (često na 85-90% maksimalnog pulsa) u usporedbi s rekreativcima.\n\nTrening tempo trčanja ('tempo run') koji se izvodi nešto ispod ili točno na laktatnom pragu omogućuje tijelu da postane učinkovitije u recikliranju laktata i njegovoj upotrebi kao gorivo.",
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
          "Tempo trčanja u zoni praga",
          "Trčanje nizbrdo",
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
      "Ekonomičnost trčanja (Running Economy - RE) definira se kao potražnja za energijom (potrošnja kisika) pri određenoj sub-maksimalnoj brzini trčanja. \n\nZnanstvenici su pokazali da trkači sa sličnim VO2max mogu imati drastično različite rezultate ovisno o njihovoj ekonomičnosti trčanja. Biomehanički faktori koji poboljšavaju RE uključuju: kraći kontakt s podlogom, optimalnu frekvenciju koraka (kadencu) i manju vertikalnu oscilaciju (skakanje gore-dolje). \n\nIstraživanja (npr. Saunders et al., 2004) naglašavaju da plyometrijski treninzi i vježbe snage poboljšavaju krutost tetiva, čime se stvara bolji povrat elastične energije pri svakom koraku, smanjujući potrošnju kisika.",
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
          "Potražnja za energijom pri zadanoj brzini",
          "Vrijeme potrebno za oporavak od utrke",
        ],
        correctIndex: 1,
      },
      {
        question:
          "Koji od navedenih faktora POMAŽE dobroj ekonomičnosti trčanja?",
        options: [
          "Velika vertikalna oscilacija (puno skakanja u zrak)",
          "Dugi kontakt noge s podstavom",
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
    ],
  },
  {
    title: "Prehrana i unos ugljikohidrata prije utrke",
    summary:
      "Strukturirano punjenje glikogenskih zaliha ključ je za sprječavanje prijevremenog umora.",
    content:
      "Zalihe glikogena u mišićima i jetri primarni su izvor energije za utrke visokog intenziteta koje traju duže od nekoliko minuta. \n\nIstraživanje provedeno od strane Burke et al. (2011) o prehrani sportaša i punjenju ugljikohidrata ('carb loading') ukazuje na to da unos 8-10 grama ugljikohidrata po kilogramu tjelesne mase dan do dva prije natjecanja maksimizira zalihe energije. \n\nZa utrke na 800m i 1500m ekstremno punjenje nije toliko nužno kao za maraton, ali optimalna rezerva glikogena štiti mišiće od zakiseljavanja i omogućava sportašu da završi završni sprint (finiš) punom snagom. Obroci bogati jednostavnim šećerima bez viška vlakana savjetuju se sat vremena prije same utrke.",
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
    ],
  },
  {
    title: "Trening snage za trkače (Eksplozivnost i prevencija ozljeda)",
    summary:
      "Zašto atletičari moraju dizati utege te kako to utječe na prevenciju ozljeda i snagu u finišu utrke.",
    content:
      "Dugo je postojala zabluda da će trening snage učiniti trkače sporima ili preteškima. Moderan znanstveni konsenzus stoji upravo suprotno.\n\nStudija autora Rønnestad i Mujika (2014) o kombinaciji treninga snage i izdržljivosti dokazala je da teški treninzi snage (s velikim kilažama i malim brojem ponavljanja, te brzo izvođenje faze kontrakcije) znatno povećavaju maksimalnu snagu mišića nogu bez značajnog povećanja mase (hipertrofije). Oboljeli zglobovi dobivaju bolju potporu tetiva, čime se prevenira trkačka potkoljenica (shin splints) i problemi s koljenom.\n\nVježbe poput stražnjeg čučnja, mrtvog dizanja i iskoraka grade snagu, dok kratki sprintevi pod opterećenjem uče živčani sustav bržoj aktivaciji vlakana (Rate of Force Development).",
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
          "Poboljšava snagu bez nepotrebnog rasta mišićne mase if se pravilno izvede",
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
    ],
  },
];

const articleRelations = {
  "Važnost VO2max u utrkama na srednje i duge pruge": {
    relatedArticleTitles: [
      "Laktatni prag i njegov utjecaj na izdržljivost",
      "Biomehanika trčanja i ekonomičnost",
    ],
    relatedExerciseTitles: ["High Knees", "Bounding"],
  },
  "Laktatni prag i njegov utjecaj na izdržljivost": {
    relatedArticleTitles: [
      "Važnost VO2max u utrkama na srednje i duge pruge",
      "Prehrana i unos ugljikohidrata prije utrke",
    ],
    relatedExerciseTitles: ["High Knees", "Butt Kicks"],
  },
  "Biomehanika trčanja i ekonomičnost": {
    relatedArticleTitles: [
      "Trening snage za trkače (Eksplozivnost i prevencija ozljeda)",
      "Važnost VO2max u utrkama na srednje i duge pruge",
    ],
    relatedExerciseTitles: ["A-Skips", "Wall Drill (Switches)", "Pogo Jumps"],
  },
  "Prehrana i unos ugljikohidrata prije utrke": {
    relatedArticleTitles: [
      "Laktatni prag i njegov utjecaj na izdržljivost",
      "Važnost VO2max u utrkama na srednje i duge pruge",
    ],
    relatedExerciseTitles: ["High Knees"],
  },
  "Trening snage za trkače (Eksplozivnost i prevencija ozljeda)": {
    relatedArticleTitles: [
      "Biomehanika trčanja i ekonomičnost",
      "Važnost VO2max u utrkama na srednje i duge pruge",
    ],
    relatedExerciseTitles: ["Romanian Deadlift", "Walking Lunges", "Box Jumps"],
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
