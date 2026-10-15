-- Datenbankschema Notenregal (SQLite)
-- Grundlage: docs/Relationen.md und docs/ERM.drawio.html

PRAGMA foreign_keys = ON;

-- ============================================================
-- Entitäten
-- ============================================================

CREATE TABLE IF NOT EXISTS Songs (
    song_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    titel     TEXT NOT NULL,
    composer  TEXT
);

-- Eine Note (PDF für ein Instrument) gehört zu genau einem Song.
CREATE TABLE IF NOT EXISTS Noten (
    noten_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    instrument  TEXT,
    pdf_link    TEXT NOT NULL,  -- Pfad/URL der PDF im WebDAV (Nextcloud)
    song_id     INTEGER NOT NULL
                REFERENCES Songs (song_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Sammlungen (
    sammlung_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Setlisten (
    setlist_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    datum       TEXT  -- ISO-8601, z. B. '2026-10-15'
);

-- Öffentliche Freigabe über einen Link, optional mit Passwort.
CREATE TABLE IF NOT EXISTS Freigaben (
    freigabe_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    titel        TEXT NOT NULL,
    passwort     TEXT,                  -- nur Hash speichern (z. B. bcrypt), NULL = ohne Passwort
    link         TEXT NOT NULL UNIQUE   -- zufälliges Token für die öffentliche URL
);

-- ============================================================
-- Beziehungstabellen (n:m)
-- ============================================================

CREATE TABLE IF NOT EXISTS Song_Sammlung (
    song_id      INTEGER NOT NULL REFERENCES Songs (song_id) ON DELETE CASCADE,
    sammlung_id  INTEGER NOT NULL REFERENCES Sammlungen (sammlung_id) ON DELETE CASCADE,
    PRIMARY KEY (song_id, sammlung_id)
);

-- position bestimmt die Reihenfolge in der Setliste.
-- Dieselbe Note darf mehrfach (an verschiedenen Positionen) vorkommen.
CREATE TABLE IF NOT EXISTS Noten_Setlist (
    noten_id    INTEGER NOT NULL REFERENCES Noten (noten_id) ON DELETE CASCADE,
    setlist_id  INTEGER NOT NULL REFERENCES Setlisten (setlist_id) ON DELETE CASCADE,
    position    INTEGER NOT NULL CHECK (position >= 1),
    PRIMARY KEY (noten_id, setlist_id, position),
    UNIQUE (setlist_id, position)
);

CREATE TABLE IF NOT EXISTS Freigabe_Song (
    freigabe_id  INTEGER NOT NULL REFERENCES Freigaben (freigabe_id) ON DELETE CASCADE,
    song_id      INTEGER NOT NULL REFERENCES Songs (song_id) ON DELETE CASCADE,
    PRIMARY KEY (freigabe_id, song_id)
);

CREATE TABLE IF NOT EXISTS Freigabe_Noten (
    freigabe_id  INTEGER NOT NULL REFERENCES Freigaben (freigabe_id) ON DELETE CASCADE,
    noten_id     INTEGER NOT NULL REFERENCES Noten (noten_id) ON DELETE CASCADE,
    PRIMARY KEY (freigabe_id, noten_id)
);

CREATE TABLE IF NOT EXISTS Freigabe_Sammlung (
    freigabe_id  INTEGER NOT NULL REFERENCES Freigaben (freigabe_id) ON DELETE CASCADE,
    sammlung_id  INTEGER NOT NULL REFERENCES Sammlungen (sammlung_id) ON DELETE CASCADE,
    PRIMARY KEY (freigabe_id, sammlung_id)
);

CREATE TABLE IF NOT EXISTS Freigabe_Setlist (
    freigabe_id  INTEGER NOT NULL REFERENCES Freigaben (freigabe_id) ON DELETE CASCADE,
    setlist_id   INTEGER NOT NULL REFERENCES Setlisten (setlist_id) ON DELETE CASCADE,
    PRIMARY KEY (freigabe_id, setlist_id)
);

-- ============================================================
-- Indizes für Fremdschlüssel / Suche (F01, F02)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_noten_song            ON Noten (song_id);
CREATE INDEX IF NOT EXISTS idx_noten_instrument      ON Noten (instrument);
CREATE INDEX IF NOT EXISTS idx_songs_titel           ON Songs (titel);
CREATE INDEX IF NOT EXISTS idx_songs_composer        ON Songs (composer);
CREATE INDEX IF NOT EXISTS idx_song_sammlung_samml   ON Song_Sammlung (sammlung_id);
CREATE INDEX IF NOT EXISTS idx_noten_setlist_noten   ON Noten_Setlist (noten_id);
CREATE INDEX IF NOT EXISTS idx_freigabe_song_song    ON Freigabe_Song (song_id);
CREATE INDEX IF NOT EXISTS idx_freigabe_noten_noten  ON Freigabe_Noten (noten_id);
CREATE INDEX IF NOT EXISTS idx_freigabe_samml_samml  ON Freigabe_Sammlung (sammlung_id);
CREATE INDEX IF NOT EXISTS idx_freigabe_setl_setl    ON Freigabe_Setlist (setlist_id);
