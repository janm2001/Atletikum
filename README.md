## ATLETIKUM

ATLETIKUM je moderna web aplikacija koja spaja znanost o sportu s elementima videoigara. Cilj je motivirati sportaše na trening, ali i naučiti ih **zašto** rade određene vježbe kroz interaktivnu bazu znanja i kvizova.

## Tehnologije (MERN Stack)

- **Frontend:** React.js (Vite)
- **Backend:** Node.js & Express
- **Baza podataka:** MongoDB (Mongoose)
- **Autentifikacija:** JWT (JSON Web Tokens) & Bcrypt

## Glavne Funkcionalnosti

- **Gamifikacija:** XP sustav, leveliranje, dnevni streakovi i bedževi.
- **S&C Log:** Detaljno praćenje treninga (setovi, ponavljanja, težina, RPE).
- **Knowledge Base:** Edukativni članci s ugrađenim kvizovima za osvajanje bodova.
- **User Profiles:** Prikaz napretka, statistike i postignuća.
- **Admin Panel:** Alat za kreiranje novih vježbi i edukativnog sadržaja.

## Struktura Projekta

- `/client` - Frontend (React)
- `/server` - Backend (API & Baza podataka)

## Kako pokrenuti projekt

- Otvoriti terminal
- npm i
- cd client
- npm i
- cd ../server
- npm i
- cd ..
- npm start

## TODO

- [x] Inicijalizacija projekta
- [x] Setup servera i spajanje na MongoDB
- [x] Inicijalizacija potrebnih paketa na frontend strani
- [x] User Auth (Register/Login)
- [ ] Refactor code with tanstack query
- [ ] Add Validation logic to login and register
- [x] Profil korisnika i Dashboard (XP/Level prikaz)
- [ ] S&C Log sustav
- [ ] Knowledge Base & Quiz engine
- [ ] Admin Dashboard

## BUGS

- [ ] Navbar for mobile
- [ ] Small flicker when directing to login page where you see the navbar
- [ ] Register paper is increasing in width when some values are changed
