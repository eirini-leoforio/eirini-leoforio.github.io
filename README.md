# Στάση Δ για Ειρήνη

Learning app for the Greek bus licence theory (category Δ), made as a gift for Ειρήνη.

- Open https://eirini-leoforio.github.io on the phone, then "Add to Home Screen".
- 191 questions from the exam book, answers from the book's answer table (p. 40).
- Greek by default, English and German on demand. Explanations and translations are AI-written.
- Progress is stored on the device. Works offline after the first visit.

Single page: `index.html`. `sw.js` adds offline support, `manifest.webmanifest` the home-screen icon.

## Reset (`/reset/`)

Personal training app (core rehab, calisthenics goals, sprint log, water, monthly challenges).

- Open https://eirini-leoforio.github.io/reset/ on the phone, then "Add to Home Screen".
- Data is stored on the device only; use "Backup speichern" under Goals now and then.
- Own service worker (`reset/sw.js`, scope `/reset/`); the root `sw.js` ignores `/reset/`.
