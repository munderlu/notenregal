# Notenregal - Ein Programm zur Verwaltung von Musiknoten

---

## 🧭 1. Kontext

### a. Beschreibung

Notenregal ist ein Programm, um Musiknoten zu verwalten. Über eine Weboberfläche kann man verschiedene Noten hinzufügen, teilen, bearbeiten und anzeigen. Ziel ist es, alle Noten Benutzers an einem Ort zu bündeln, durchsuchbar zu machen und ein einfaches Teilen zu ermöglichen.

Eine mobile App für Tablet und Smartphone soll das Lesen der Noten ermöglichen, mit offline Zugriff, Möglichkeit für Notizen und Links im Dokument.

### b. Stakeholder

| Stakeholder                           | Beschreibung                                 | Ziel / Interesse                               |
| ------------------------------------- | -------------------------------------------- | ---------------------------------------------- |
| Hauptnutzer| Hauptnutzende der App                        | möchte alle seine Noten an einem Ort verwalten und sie über die App abrufen können|
| Mitspieler |spielt in Ensembles mit dem Hauptnutzer und möchte von der Notensammlung profitieren | möchte Noten geteilt bekommen und diese als PDF herunterladen können oder sie anzeigen|

---

## ⚙️ 2. Funktionale Anforderungen

| ID  | Anforderung                         | Beschreibung                                                                        | Priorität  |
| --- | ----------------------------------- | ----------------------------------------------------------------------------------- | ---------- |
| F01 | Notenübersicht| Eine Datenbank macht Noten durchsuchbar| 🟢 Hoch    |
| F02 | Organisation| Noten können nach Instrument, Sammlungen, Songs), Komponist gruppiert werden. Es können mehrere Noten unterschiedlicher Instrumente zu einem Song gehören | 🟢 Hoch    |
| F03 | Setlisten|Einzelne Noten können in Setlisten zusammengefasst werden, damit sie hintereinander angezeigt werden, um bei einem Auftritt die Noten nicht einzeln suchen zu müssen.|  🟠 Mittel  |
| F04 | Freigabe |Noten oder Songs können in einer Freigabe zusammengefasst und über einen öffentlichen Link (optional mit Passwort) geteilt werden| 🟢 Hoch    |
| F05 | Login| Der Hauptnutzer soll sich mit einem Passwort identifizieren um vollen Zugriff zu erhalten und Freigaben zu erstellen| 🟢 Hoch |
| F06 | Speicherung über WebDAV | alle Noten werden zentral in Nextcloud über WebDAV gespeichert| 🟢 Hoch  |
| F07 | Noten-Anzeige|Noten können angezeigt werden| 🟢 Hoch |
|F08|Noten-Kommentare|Über Noten kann per Freihand oder Text kommentiert werden. Export soll mit oder ohne Kommentare möglich sein.|  🟠 Mittel|
|F09| Halbes-Blättern| eine Funktion soll es ermöglichen, dass man halbe PDF-Seiten blättern kann und dadurch nie den Blick über die Noten verliert| 🟠 Mittel|
|F10|Bluetooth-Pedal|Man soll mit einem Bluetooth-Pedal blättern können (simuliert Pfeiltasten)| 🟠 Mittel|
|F11|Android-App|eine Web basierte App soll die Website spiegeln und offline Dateizugriff ermöglichen| 🟠 Mittel|

---

## 🧱 3. Nicht-funktionale Anforderungen

| Kategorie            | Beschreibung                                              | Ziel                           |
| -------------------- | --------------------------------------------------------- | ------------------------------ |
| 🧠 **Usability**     | Intuitive, klare Benutzeroberfläche                       | Geringe Einarbeitungszeit      |
| ⚡ **Performance**    | schnelle Ladezeiten                   | Hohe Reaktionsgeschwindigkeit  |
| 🔐 **Sicherheit**    | Sichere Authentifizierung                  | es soll zu keinen Urheberrechtsverletzungen oder unauthorisierten Zugriffen kommen      |
| 🧩 **Modularität**   | Erweiterbare Architektur (z. B. mehrere Benutzer) | Skalierbarkeit sicherstellen   |
| 🧪 **Testbarkeit**   | Unit- und Integrationstests vorhanden                     | Codequalität sicherstellen     |
| 🔄 **Wartbarkeit**   | Saubere Code-Struktur, Dokumentation                      | Einfache Weiterentwicklung     |

---

## 🧭 4. Abgrenzung & MVP

Das Projekt wird **inkrementell** entwickelt. Ziel ist zunächst ein **Minimal Viable Product (MVP)**, das den Kernnutzen demonstriert.  
Funktionen außerhalb des MVP werden als **Future Work** dokumentiert.

### 🎯 MVP (Umfang des Projekts)

- Speicherung der Noten
- organisieren in Songs (verschiedene Noten) und Sammlungen (verschiedene Songs)
- Teilen von Songs und Sammlungen
- anzeigen von Noten

### 🚫 Nicht Teil des MVP

- erstellen von Setlisten
- kommentieren von Noten
- App

---

## 📖 5. Dictionary / Gemeinsames Begriffsverzeichnis

Das Dictionary legt fest, was ich im Projekt unter einem Begriff verstehen.

|Begriff|Definition|
|---|---|
|Noten|ein PDF in der sich Musiknoten für einen Song befinden|
|Song|ein Songs kann auch einem bis mehreren Noten bestehen|
|Sammlung|eine Sammlung besteht aus mehreren Songs|
|Freigabe|eine Freigabe kann eine Sammlung, mehrere Songs oder auch nur Noten enthalten|
|Setliste|eine Setliste besteht aus mehreren Noten, die hintereinander an einem Auftritt angezeigt werden können|

---

## 🧰 Tools & Technologien

- Backend mit Nodejs
- Frontend mit React
- App mit React Native?!
- Datenbank SQLite
- WebDAV zur Verbindung mit Nextcloud

---
