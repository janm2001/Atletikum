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
- [x] Refactor code with tanstack query
- [x] Use react hook form for each form validations
- [x] Add Validation logic to login and register
- [x] Profil korisnika i Dashboard (XP/Level prikaz)
- [x] Use ExerciseDb RapidApi for displaying exercises
- [x] S&C Log sustav
  - [x] workout and workout logs backend logic
  - [x] Tabs for workouts and workout logs
  - [x] workouts card
  - [x] exercise details based on exerciseId
  - [x] Update user xp when completing a workout
  - [ ] Make an option for the user to make a custom workout

- [x] Knowledge Base & Quiz engine
  - [x] Extract quizes to the seperate page
  - [x] Give interactive xp gains after the user completes the quiz

- [ ] Admin Dashboard
  - [ ] Make sure that content in the articles are working

## BUGS AND REFACTORS

- [x] Navbar for mobile
- [x] Small flicker when directing to login page where you see the navbar
- [ ] Register paper is increasing in width when some values are changed
- [x] Error boundry when there is an error
- [x] Suspense and lazy loading
- [ ] Refactor everything to a proper component
- [ ] Workout logs are the same for all the users, it needs to show for the specific user
