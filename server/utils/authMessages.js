const AUTH_MESSAGES = {
  usernameMin: "Korisničko ime mora imati barem 3 znaka",
  usernameMax: "Korisničko ime može imati najviše 30 znakova",
  emailInvalid: "Molimo unesite valjanu email adresu",
  emailMax: "Email adresa može imati najviše 254 znaka",
  passwordMin: "Lozinka mora imati barem 8 znakova",
  passwordMax: "Lozinka može imati najviše 32 znaka",
  passwordLowercase: "Lozinka mora sadržavati barem jedno malo slovo",
  passwordUppercase: "Lozinka mora sadržavati barem jedno veliko slovo",
  passwordNumber: "Lozinka mora sadržavati barem jedan broj",
  passwordSpecial: "Lozinka mora sadržavati barem jedan poseban znak",
  resetTokenInvalid: "Token za reset lozinke nije valjan",
  trainingFrequencyInvalid: "Frekvencija treninga mora biti između 0 i 7",
  focusInvalid: "Fokus treninga nije valjan",
  loginCredentialsRequired: "Molimo unesite korisničko ime ili email i lozinku",
  loginInvalidCredentials: "Pogrešno korisničko ime/email ili lozinka",
  resetRequestFieldsRequired: "Molimo unesite korisničko ime i email adresu",
  resetRequestGeneric:
    "Ako uneseni podaci odgovaraju korisniku, upute za reset lozinke su pripremljene.",
  resetPasswordFieldsRequired: "Nedostaje token ili nova lozinka",
  resetPasswordInvalidOrExpired:
    "Poveznica za reset lozinke nije valjana ili je istekla",
  resetPasswordSuccess: "Lozinka je uspješno promijenjena.",
  unauthorizedRole: "Nemate dozvolu za ovu radnju.",
  authRequired: "Niste prijavljeni. Molimo prijavite se.",
  invalidToken: "Nevažeći token ili neautoriziran pristup.",
  userNoLongerExists: "Korisnik više ne postoji.",
  tokenExpired: "Token je istekao. Molimo prijavite se ponovno.",
  rateLimitAuth:
    "Previše zahtjeva s ove IP adrese. Pokušajte ponovo za 15 minuta.",
};

module.exports = {
  AUTH_MESSAGES,
};
