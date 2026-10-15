// backend/src/db/index.js
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const SCHEMA_PATH = path.join(import.meta.dirname, 'schema.sql');
const DEFAULT_DB_PATH = path.join(import.meta.dirname, '..', '..', 'data', 'notenregal.db');

/**
 * Öffnet die SQLite-Datenbank und legt fehlende Tabellen an.
 * @param {string} [dbPath] Dateipfad oder ':memory:' (z. B. für Tests)
 */
export function openDatabase(dbPath = process.env.DB_PATH || DEFAULT_DB_PATH) {
    if (dbPath !== ':memory:') {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }

    const db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');
    db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));

    return db;
}
