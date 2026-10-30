// Educational lessons, not exercise prescriptions or automated technique assessments.
const lessons = [
  {
    id: "sjedni-ustani", title: "Sjedni i ustani", category: "Kontrola pokreta",
    summary: "Upoznaj pokret u tri mala koraka.", minutes: 2, illustration: "sit-to-stand",
    introduction: "Pogledaj ilustraciju. Za vježbanje zamoli trenera ili roditelja da bude uz tebe.",
    steps: [
      { title: "Stopala na podu", cue: "Stani ispred stabilne klupe. Trener neka ti pomogne s početnim položajem.", tip: "Klupe i stolice s kotačićima nisu za ovu vježbu." },
      { title: "Sjedni polako", cue: "Savij kukove i koljena. Lagano sjedni na klupu.", tip: "Ne žuri. Trener ti može pomoći pronaći ugodan pokret." },
      { title: "Ustani mirno", cue: "Osloni se na stopala i vrati se u stojeći položaj.", tip: "Ako pokret boli, stani i reci odrasloj osobi." },
    ],
    question: "Što radiš ako te pokret boli?",
    options: ["Nastavim da osvojim još bodova.", "Stanem i kažem treneru ili roditelju.", "Pokušam napraviti pokret brže."],
    correctIndex: 1,
    explanation: "Briga o sebi dio je sporta. Bol je razlog da staneš i kažeš odrasloj osobi, a ne da skupljaš još ponavljanja.",
  },
  {
    id: "ravnoteza", title: "Pronađi ravnotežu", category: "Ravnoteža",
    summary: "Upoznaj miran položaj i siguran oslonac.", minutes: 2, illustration: null,
    introduction: "Ovu lekciju možeš pročitati bez vježbanja. Pokret isprobaj uz trenera ili roditelja.",
    steps: [
      { title: "Pripremi prostor", cue: "Odaberi ravan pod bez prepreka. Ostani blizu stabilnog oslonca i odrasle osobe.", tip: "Nemoj vježbati ravnotežu na visini ili skliskoj podlozi." },
      { title: "Podigni jedno stopalo", cue: "Uz pomoć odrasle osobe lagano odigni jedno stopalo. Gledaj točku ispred sebe.", tip: "Smiješ se pridržati. Cilj nije izdržati najdulje." },
      { title: "Vrati se na oba stopala", cue: "Spusti stopalo kad poželiš ili kad izgubiš ravnotežu.", tip: "Trener ti može pomoći s obje strane. Nema natjecanja ni žurbe." },
    ],
    question: "Što je dobar izbor dok učiš ravnotežu?",
    options: ["Stajati što više iznad poda.", "Nastaviti i kad mi se vrti.", "Biti blizu oslonca i pridržati se kad trebam."],
    correctIndex: 2,
    explanation: "Stabilan oslonac i pomoć odrasle osobe olakšavaju učenje. Spusti stopalo kad trebaš.",
  },
  {
    id: "odmor", title: "Odmor je dio napretka", category: "Briga o sebi",
    summary: "Nauči prepoznati kada trebaš predah.", minutes: 1, illustration: null,
    introduction: "Danas možeš učiti i odmarati. Za ovu lekciju ne trebaš ništa vježbati.",
    steps: [
      { title: "Primijeti kako se osjećaš", cue: "Jesi li umoran/na? Boli li te nešto? Reci odrasloj osobi kako se osjećaš.", tip: "Ne moraš dokazivati da možeš nastaviti." },
      { title: "Dogovori predah", cue: "Trener ili roditelj pomoći će ti uskladiti trening, školu, igru i odmor.", tip: "I trening u klubu i utakmica dio su tvog dana." },
      { title: "Sačuvaj naučeno", cue: "Naučene lekcije ostaju tvoje i kad odmaraš ili ne otvoriš aplikaciju.", tip: "Bodovi i nizovi nisu razlog za dodatni trening." },
    ],
    question: "Što se događa s naučenim lekcijama kad odmaraš?",
    options: ["Ostaju spremljene. Odmor je dio sporta.", "Moram trenirati da ih ne izgubim.", "Moram otvoriti aplikaciju svaki dan."],
    correctIndex: 0,
    explanation: "Tvoj napredak ostaje spremljen. Možeš odmarati bez otvaranja aplikacije i bez gubitka naučenih lekcija.",
  },
];

const publicLessons = () => lessons.map(({ correctIndex, explanation, ...lesson }) => lesson);
module.exports = { lessons, publicLessons };
