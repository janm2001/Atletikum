// User-authored Notion text, read on 2026-10-30. Original wording is preserved.
// Croatian summaries, editorial context and comprehension questions are additions.
const escapeHtml = (text) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const blogs = [
  {
    _id: "6a0000000000000000000101",
    title: "Norwegian Singles Method",
    sourceUrl: "https://app.notion.com/p/Norwegian-Singles-Method-3e39de575ab08020bac6df97d2404886",
    summary: "Janov osvrt na Norwegian Singles: kontrolirani intenzitet, lagani dani i prilagodba treninga obvezama odraslog trkača.",
    tag: "PERIODIZATION",
    editorialNote: "Izvorni autorski tekst na engleskom. Sažetak i pitanja za razumijevanje dodani su na hrvatskom; ilustracije iz Notiona nisu prenesene. Primjer tjedna namijenjen je kontekstu iskusnih odraslih trkača, ne djeci. Brojčane zone laktata i pulsa nisu univerzalne granice niti jamstvo sigurnog opterećenja; individualni plan dogovara se s kvalificiranim trenerom.",
    paragraphs: [
      "New model of training that is popular in the past years is Norwegian Double Threshold method, but that is nothing new in fact it was developed first by Marius Bakken in 1998. Then the Ingebrigsten brothers came with European and then World championship medals and many training programs adopted this method.",
      "Now for the average working people this would be a simple recipe for an injury. Simply because they cannot do 2 workouts a day without having a sufficient rest needed before sessions. Also the double threshold method is developed for people that have high amount of mileage so they can sustain the pure volume that it takes to do double threshold workout in one day. It can easily get to over 30km which is a lot.",
      "People started thinking how can they adopt this training for people with full time jobs and people who cannot train on professional level. Here came the older brother of Ingebrigsten, Kristan who came up with the plan to do 3 workouts a week with single threshold. Later this method was further modernized by the Englishman James Copeland. Running lovers tend to read topics on Letsrun and this topic is one of the most talked about on the Forum with the whooping 719 pages currently on the thread.",
      "The training principles are simple for this method, run 3 quality threshold sessions a week. Here we have reps over 3 minutes long up to 10 minutes long or 3km. Other days are easy with one long run on the weekend that is also easy without doing any intervals or progressing into the threshold zone.",
      "Sample week could look like this:\nMon : 45 min easy\nTue : 10x1km Threshold with 1 minute standing rest\nWed: 60 min easy\nThu : 6x1.6km Threshold with 75-90s standing rest\nFri : 45 min easy\nSat: 3x3km Threshold with 90-120s standing rest\nSun : 90 min easy long run",
      "James Copeland argues about doing shorter intervals that are less than 3 minutes that it tires the legs too much for the next workouts so he avoids them. Typical session in double threshold session would be one session with shorter reps like 20x400m with 30s rest. Also Marius Bakken suggested even shorter intervals of 45s with only 15s rest, he argues that you can sustain the speeds of 5k race without tiring yourself too much.",
      "The main idea about this training is to have the same intensity each run and that intensity is hard running but without being tired that you cannot continue doing any more reps, for example you have schedule 10 reps of 1km but after you’ve done them your legs are cooked and you struggle with the cooldown. That is wrong. You need to easily do 2 more reps in order to be in the threshold zone under 4 mmol. Threshold zone is between 2 and 4 mmol, it is not always perfect on those levels for all athletes but we will use universal numbers here. Aiming for the lower end of that range is better to be sure that you are in the zone and in optimal sub threshold range. The tricky part is that we do not really know how much mmol we have in the blood so it is hard to judge our efforts without having the Lactate meter, with the various methods like looking at your heart rate and not exciding 90%, talk test where you can say 3 sentences without needing to breath will tell you if you are in the right zone.",
      "People have egos and often do this workouts wrong and too fast, they do not see the benefits from it and quit. So in theory this is simple boring training for people that want the most consistent benefits. Sure some training programs would give you better benefits but the argument here is that this program is best for most people.",
      "Since the method is simple it does not include some elements that are important for the success of runners like sprints or x factor workouts that are included with most professional athletes, this is a known fact and the method focused on doing 97% of things that will give you benefits leaving something on the table. But with average of 5-7 hours available for the working people this is the best they can do it the limited time they have for training.",
      "For people who would like to know more in details about this methods, there are two new amazing books about Norwegian singles method by James Copeland and The Norwegian method applied by Marius Bakken.",
    ],
    actionSummary: ["Razlikuj opis metode od individualnog plana treninga.", "U članku su lagani dani i kontrola intenziteta važni dijelovi pristupa.", "Primjer tjedna nije preporuka za djecu od 8 do 12 godina."],
    quiz: [
      { question: "Koju poteškoću autor ističe kod kopiranja double threshold metode uz posao?", options: ["Premalo različitih tenisica.", "Velik volumen i nedovoljno vremena za oporavak između treninga.", "Previše dana bez trčanja."], correctIndex: 1 },
      { question: "Kakvi su ostali dani i dugo trčanje u opisanom Singles pristupu?", options: ["Uvijek maksimalno brzi.", "Svakodnevne utrke.", "Lagani, bez pretvaranja dugog trčanja u dodatni threshold trening."], correctIndex: 2 },
      { question: "Što autor smatra znakom da je trening odrađen preintenzivno?", options: ["Potpuna iscrpljenost nakon zadnjih ponavljanja i teško rastrčavanje.", "Ostaje osjećaj da bi se moglo nastaviti.", "Tempo je kontroliran."], correctIndex: 0 },
      { question: "Zašto autor naglašava kontrolu ega?", options: ["Jer je cilj pobijediti druge na svakom treningu.", "Jer prebrza ponavljanja mogu narušiti kontrolu intenziteta i kontinuitet.", "Jer lagani dani nisu važni."], correctIndex: 1 },
      { question: "Kako treba čitati primjer tjedna u kontekstu Atletikuma za djecu?", options: ["Kao obvezni plan za svako dijete.", "Kao plan koji kviz automatski otključava.", "Kao edukativni primjer za odrasle, a ne dječji raspored treninga."], correctIndex: 2 },
    ],
  },
  {
    _id: "6a0000000000000000000102",
    title: "Hill training guide",
    sourceUrl: "https://app.notion.com/p/Hill-training-guide-3e49de575ab0804ba5a2ce3759dc2211",
    summary: "Janov vodič kroz kratke sprinteve i duža ponavljanja uzbrdo, s naglaskom na oporavak, tehniku i svrhu treninga.",
    tag: "TRAINING",
    editorialNote: "Izvorni autorski tekst na engleskom; sažetak i kviz dodani su na hrvatskom. Maksimalni sprintovi, RPE 8–9 i navedeni intervalni primjeri nisu zadaci za djecu od 8 do 12 godina. Napredovanje nije obveza svakog treninga: izbor terena, količinu i intenzitet prilagođava kvalificirani trener. Pogoršanje tehnike, umor ili bol razlog su za preispitivanje opterećenja.",
    paragraphs: [
      "Hill training for runners are very benefits especially in the base building phase. It also promotes good form in runners when they lift their knees and really push off the ground.",
      "There are various variations that the runner can do but starting hill training should be with the hill sprints so body get used to it since it will give you more strain to your calf's since you are fighting gravity. The simplest approach would be to do regular easy run and then instead of strides replace them with short 6-10 seconds hill sprints.",
      "Hill sprints should be done with maximum power, the rest is long you can either walk down to recover and you will take at least 2 minutes, it can even be a jog rest as many minutes as you need to fully recover, because the goal is to do every rep the same with the same power and effort. If you see your form breaking down you should take more rest or stop completely because you will do more harm then good.",
      "After adding hill sprints and doing them regularly you can replace one of your workouts with the hill repeats workouts. It is usually a pretty hard effort around 8/9 RPE. The rest for hill repeats is jog down recovery. The repeats are usually 30 to 2 minutes long. You can even extend them in some variations but some popular hill repeats are 10x30s with jog down recovery 8x1min with jog down recovery, there are even some variations like pyramid work of 400-800-1200-1600-1200-800-400m with 1-2-3-4-3-2-1 minute jog down recovery which would be a prolonged variation.",
      "While doing hill repeats it is important to progress your training either with more repeats or doing a higher effort. The hills are useful until you need to do specific work for your work. Then the recommendations is to replace them because you cannot do the same speed on the flat ground and on the hill. Same goes with sprints it is recommended to progress them on the track where you do all out sprints for speed development.",
    ],
    actionSummary: ["Razlikuj kratke sprinteve uzbrdo od duljih intervalnih ponavljanja.", "Prema članku, raspad tehnike razlog je za dulji odmor ili prekid.", "Odrasli trener prilagođava teren i opterećenje; primjeri nisu dječji dnevni zadaci."],
    quiz: [
      { question: "U kojoj fazi autor posebno ističe korisnost treninga uzbrdo?", options: ["U fazi izgradnje baze.", "Isključivo dan prije utrke.", "Samo nakon ozljede, bez procjene."], correctIndex: 0 },
      { question: "Što je prema članku svrha duljeg odmora između kratkih sprintova?", options: ["Skupiti što više ponavljanja bez obzira na izvedbu.", "Oporaviti se kako bi se sačuvala kvaliteta idućeg ponavljanja.", "Povećati iscrpljenost prije idućeg sprinta."], correctIndex: 1 },
      { question: "Što autor predlaže ako se tehnika počne raspadati?", options: ["Ubrzati iduće ponavljanje.", "Dodati još ponavljanja.", "Uzeti više odmora ili prekinuti trening."], correctIndex: 2 },
      { question: "Koja je važna razlika između opisanih kratkih sprintova i hill repeats?", options: ["Trajanje ponavljanja i organizacija oporavka.", "Samo naziv, bez drugih razlika.", "Hill repeats se uvijek rade nizbrdo."], correctIndex: 0 },
      { question: "Zašto prema članku brdo ne zamjenjuje sav specifični rad na ravnome?", options: ["Jer se na ravnome nikada ne trenira tehnika.", "Jer se brzine i zahtjevi trčanja uzbrdo i na ravnome razlikuju.", "Jer se na brdu ne treba odmarati."], correctIndex: 1 },
    ],
  },
];

const authorBlogs = blogs.map(({ paragraphs, ...blog }) => ({
  ...blog,
  content: paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br/>")}</p>`).join("\n"),
  sourceTitle: `Autorski blog: ${blog.title}`,
  author: "Jan",
  audience: "coaches",
  difficulty: "advanced",
  relatedExerciseIds: [],
  relatedArticleIds: blogs.filter((other) => other._id !== blog._id).map((other) => other._id),
}));
module.exports = { authorBlogs };
