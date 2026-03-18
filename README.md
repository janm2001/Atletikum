# Atletikum

Atletikum je gamificirana fitness aplikacija za praćenje treninga, napretka i edukacije. Izgrađena je na MERN stacku (MongoDB, Express, React, Node.js) s XP/level sustavom, nizovima (streak), bedževima, zapisima treninga, bazom znanja s kvizovima i admin panelom.

---

## Tehnologije

### Frontend

| Tehnologija                 | Opis                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| **React 19**                | Glavna UI biblioteka za izgradnju korisničkog sučelja s komponentama                      |
| **TypeScript**              | Dodaje statičko tipiziranje JavaScriptu za sigurniji i pouzdaniji kod                     |
| **Vite**                    | Brzi build alat i dev server s hot module replacement (HMR)                               |
| **Mantine UI v8**           | Biblioteka gotovih UI komponenti (gumbi, modali, forme, tablice, grafovi, notifikacije)   |
| **TanStack React Query v5** | Upravljanje server stanjem — automatsko cachiranje, refetchanje i sinkronizacija podataka |
| **React Router v7**         | Navigacija između stranica s lazy loadingom i zaštićenim rutama                           |
| **React Hook Form + Zod**   | Upravljanje formama i validacija unosa pomoću shema                                       |
| **Tiptap**                  | WYSIWYG uređivač bogatog teksta za pisanje članaka (linkovi, highlight, poravnanje)       |
| **Recharts**                | Biblioteka za vizualizaciju podataka kroz grafove (workout statistika)                    |
| **Axios**                   | HTTP klijent za komunikaciju s backendom, s JWT interceptorom                             |
| **i18next**                 | Internacionalizacija — svi tekstovi su na hrvatskom jeziku                                |
| **Tabler Icons**            | Biblioteka ikona korištena kroz cijelu aplikaciju                                         |
| **Vitest**                  | Framework za pisanje i pokretanje unit testova                                            |
| **ESLint**                  | Alat za statičku analizu koda i održavanje kvalitete                                      |

### Backend

| Tehnologija            | Opis                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| **Node.js**            | JavaScript runtime za pokretanje servera                              |
| **Express 5**          | Web framework za REST API s rutama, middleware-om i kontrolerima      |
| **MongoDB + Mongoose** | NoSQL baza podataka s ODM-om za definiranje shema i modela            |
| **JWT (jsonwebtoken)** | Token-bazirana autentikacija korisnika                                |
| **Bcryptjs**           | Hashiranje lozinki za sigurno pohranjivanje                           |
| **Helmet**             | Postavljanje sigurnosnih HTTP zaglavlja                               |
| **express-rate-limit** | Ograničavanje broja zahtjeva (rate limiting) za zaštitu od zlouporabe |
| **Cloudinary**         | Opcionalni cloud storage za slike članaka                             |
| **Multer**             | Middleware za upload datoteka                                         |
| **sanitize-html**      | Sanitizacija HTML sadržaja protiv XSS napada                          |
| **Jest**               | Framework za pisanje i pokretanje testova na backendu                 |

---

## Ekrani aplikacije

### Javni ekrani (bez prijave)

#### Prijava (`/login`)

Ekran za prijavu korisnika s korisničkim imenom i lozinkom. Sadrži link za zaboravljenu lozinku i link za registraciju novih korisnika.

#### Registracija (`/register`)

Forma za kreiranje novog korisničkog računa. Korisnik unosi korisničko ime, email i lozinku, odabire fokus treninga (npr. snaga, hipertrofija) i željenu frekvenciju treninga (0-7 dana tjedno) pomoću slidera.

#### Dobrodošlica (`/dobrodosli`)

Ekran koji se prikazuje nakon uspješne registracije. Predstavlja 6 glavnih značajki aplikacije: praćenje treninga, XP sustav, baza znanja, postignuća, ljestvica i osobni rekordi.

#### Zaboravljena lozinka (`/zaboravljena-lozinka`)

Forma za zahtjev za resetiranje lozinke putem korisničkog imena i emaila.

#### Resetiranje lozinke (`/reset-lozinka/:token`)

Forma za postavljanje nove lozinke putem tokena primljenog emailom.

---

### Zaštićeni ekrani (nakon prijave)

#### Pregled / Dashboard (`/pregled`)

Glavni hub aplikacije. Prikazuje:

- Pozdravnu poruku i mrežu statistika (level, XP, streak)
- Vizualizaciju XP napretka
- Karticu tjednog cilja s AI preporukama
- Karticu za nastavak učenja (nedovršeni članci)
- Karticu za ponavljanje (članci spremni za ponovni kviz)
- Osobne rekorde (personal bests)
- Istaknute članke
- Predloženi trening
- Brzi odabir vježbi

#### Zapis treninga (`/zapis-treninga`)

Ekran s dva taba:

- **Treninzi**: Pregledavanje predloženih treninga i kreiranje vlastitih treninga
- **Zapisi treninga**: Povijest završenih treninga s grafovima i statistikama performansi

#### Praćenje treninga (`/zapis-treninga/:id`)

Puni ekran za praćenje aktivnog treninga:

- Prikaz vježbi jednu po jednu s detaljima u modalu
- Unos setova, ponavljanja, težine i RPE-a za svaku vježbu
- Pregled zarađenog XP-a u stvarnom vremenu
- Praćenje osobnih rekorda (PB)

#### Baza znanja / Edukacija (`/edukacija`)

Hub za učenje i edukaciju:

- Mreža kartica članaka (responzivno: 1-3 stupca)
- Filtriranje po tagovima/kategorijama
- Prebacivanje između svih članaka i spremljenih članaka
- Sustav bookmarkova i praćenje statusa dovršenosti

#### Detalj članka (`/edukacija/:id`)

Prikaz pojedinog članka:

- Zaglavlje s naslovom, autorom, datumom, napretkom i bookmarkom
- Naslovna slika i bogati HTML sadržaj
- Sažetak akcijskih koraka
- Gumb "Označi kao pročitano" koji nakon klika mijenja stanje u "Pročitano"
- Kartica izvora s URL-om
- Sekcija kviza (ako je dostupan)
- Povezani članci (carousel)
- Povezane vježbe

#### Kviz (`/edukacija/:id/kviz`)

Interaktivni kviz vezan uz članak:

- Prikaz pitanja jedno po jedno
- Višestruki izbor odgovora
- Cooldown sustav (npr. 24h između pokušaja)
- Povratak na članak

#### Ljestvica (`/ljestvica`)

Natjecateljska rang lista korisnika:

- Podij za top 3 korisnika
- Tablica svih korisnika s rangom
- Istaknut rang trenutnog korisnika
- Klik na korisnika otvara njegov profil

#### Admin panel (`/upravljanje`)

Panel za upravljanje sadržajem (dostupan samo adminima):

- **Tab Vježbe**: Kreiranje, uređivanje i brisanje vježbi s mišićnim grupama
- **Tab Edukacija**: Kreiranje, uređivanje i brisanje članaka s naslovnim slikama, sadržajem i kviz pitanjima
- **Tab Treninzi**: Kreiranje, uređivanje i brisanje predložaka treninga s dodijeljenim vježbama

#### Profil (`/profil`)

Korisnički profil:

- Avatar s inicijalima
- Prikaz levela i ukupnog XP-a
- Popis postignuća / bedževa
- Sigurnosne postavke (promjena lozinke)

#### Slavlje (`/slavlje`)

Animirani ekran slavlja nakon završenog treninga ili kviza:

- Confetti animacija
- Prikaz zarađenog XP-a (s podjelom na Brain XP i Body XP za treninge)
- Ring grafikon napretka levela
- Kartice novoosvojenih postignuća
- Ostvareni osobni rekordi
- Navigacija natrag na dashboard ili prethodnu sekciju

---

## Ključne značajke

- **Gamifikacija**: XP za svaki trening (Body XP) i kviz (Brain XP), sustav levelanja
- **Dnevni niz (Streak)**: Nagrađuje konzistentnost treniranja
- **Postignuća / Bedževi**: Otključavaju se na određenim miljokamenima
- **Osobni rekordi**: Automatska detekcija PB-a s karticama slavlja
- **Pametne preporuke**: AI predlaže sljedeći trening, članke za čitanje i kvizove za ponavljanje
- **Bogati sadržaj**: WYSIWYG editor za članke, podrška za slike (Cloudinary ili lokalno)
- **Kviz sustav**: Višestruki izbor s cooldownom i praćenjem napretka
- **Vlastiti treninzi**: Korisnici mogu kreirati vlastite predloške treninga
- **Natjecateljska ljestvica**: Globalni rang po ukupnom XP-u
- **Admin alati**: Potpuni CRUD za vježbe, članke i treninge
- **Tamna/Svijetla tema**: Prebacivanje putem navigacijske trake
- **Responzivni dizajn**: Hamburger izbornik, responzivne mreže
- **Hrvatski jezik**: Cjelokupno sučelje je na hrvatskom

---

## API konfiguracija

Frontend API pozivi koriste `VITE_API_BASE_URL`.

- Lokalni fallback (ako varijabla nije postavljena): `http://localhost:5001/api/v1`
- Produkcijski primjer: `VITE_API_BASE_URL=https://your-backend-domain/api/v1`
