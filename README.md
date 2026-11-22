# Gym Mission 💪 – von 60 auf 70 kg

Eine installierbare Web-App (PWA), die beim **Zunehmen** hilft – nicht beim Training, sondern beim Essen.

## Funktionen
- **Heute:** Fortschrittsring zum Zielgewicht, Morgengewicht, kcal/Protein-Balken, 8 Tagesmissionen zum Abhaken, Tipp & Motivationsspruch des Tages
- **Training:** 3er-Split: A Brust/Trizeps, B Rücken/Bizeps, C Beine/Schultern, jeden Satz abhaken, Arbeitsgewicht merken, Training abschließen
- **Fortschritt:** Gewichtsverlauf mit 7-Tage-Schnitt, Wochenstatistik, Missions-Kalender, Meilensteine 61–70 kg
- **Coach:** prüft wöchentlich dein Tempo (Ziel 0,25–0,5 kg/Woche) und schlägt eine Anpassung des Kalorienziels vor
- **Essen:** „Was soll ich jetzt essen?“ (passend zu Uhrzeit und fehlenden kcal), Tages-Essensplan passend zum Kalorienziel, Einkaufsliste, 19 Rezepte zum Zunehmen
- **Muskel-Scan:** Hologramm färbt trainierte Muskeln rot (heute / 7 Tage)
- **Wochenrückblick:** jeden Sonntag ab 17 Uhr mit Note (A–D), Kennzahlen, Bestleistungen und Fokus für die nächste Woche
- **Statistiken:** Kalorien 14 Tage, Wochentag-Analyse, Kraftentwicklung, Trainingsvolumen, Muskelverteilung, Rekorde
- **Motivation:** XP, Level, Streak (Tage mit erreichtem Kalorienziel), Bonus für perfekte Tage
- **YAZIO-Sync (iPhone):** YAZIO → Apple Health → Kurzbefehl öffnet `…/?kcal=2900&protein=120` → wird automatisch eingetragen. Anleitung im Tab „Setup“.

Alle Daten bleiben lokal auf dem Gerät (Backup-Export im Setup).

## Starten
Keine Abhängigkeiten, kein Build. Lokal: `python3 -m http.server` und `http://localhost:8000` öffnen.
Für das Handy: GitHub Pages aktivieren (Settings → Pages → Branch wählen), Link im Handy-Browser öffnen und „Zum Home-Bildschirm hinzufügen“.

## 💜 Let's Workout (Ordner `herz/`)
Schwester-App zum **Abnehmen**, gleicher Aufbau, eigener Speicher: Kalorien-Defizit (nie unter 1.200 kcal, kein Untergewicht als Ziel), Home-Workout-Plan (Po & Beine / Oberkörper & Bauch / Ganzkörper-Fatburner), laktosefreie leichte Rezepte, Schritte-Ziel 8.000, Herz-Heißluftballon statt Berg, lila Design mit Herzen.
Link: https://joellanini26-arch.github.io/Gym-Mission/herz/
