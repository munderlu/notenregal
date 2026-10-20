// backend/src/routes/api_routes.js
import { Router } from "express";
import { getDb } from "../db/index.js";

export const apiRouter = Router();

// Songs

// Alle Songs, optional gefiltert nach Sammlung (Name).
// Die Zuordnung liegt in der Beziehungstabelle Song_Sammlung.
apiRouter.get("/songs{/:sammlung}", (req, res) => {
    try {
        const db = getDb();
        const rows = req.params.sammlung
            ? db.prepare(`
                SELECT s.*
                FROM Songs s
                JOIN Song_Sammlung ss ON ss.song_id = s.song_id
                JOIN Sammlungen sm     ON sm.sammlung_id = ss.sammlung_id
                WHERE sm.name = ?
            `).all(req.params.sammlung)
            : db.prepare("SELECT * FROM Songs ORDER BY title").all();

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});

apiRouter.post("/songs", (req, res) => {
    try {
        const { title, composer } = req.body ?? {};
        if (typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({ error: "Titel ist erforderlich" });
        }

        const db = getDb();
        const result = db
            .prepare("INSERT INTO Songs (title, composer) VALUES (?, ?)")
            .run(title.trim(), composer?.trim() || null);
        const newSong = db.prepare("SELECT * FROM Songs WHERE song_id = ?").get(result.lastInsertRowid);
        res.status(201).json(newSong);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});
