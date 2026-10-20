// backend/src/routes/api_routes.js
import { Router } from "express";
import { getDb } from "../db/index.js";

export const apiRouter = Router();

const db = getDb();

// Songs

// Alle Songs, optional gefiltert nach Sammlung (Name).
// Die Zuordnung liegt in der Beziehungstabelle Song_Sammlung.
apiRouter.get("/songs{/:sammlung}", (req, res) => {
    try {
        const rows = req.params.sammlung
            ? db.prepare(`
                SELECT s.*
                FROM Songs s
                JOIN Song_Sammlung ss ON ss.song_id = s.song_id
                JOIN Sammlungen sm     ON sm.sammlung_id = ss.sammlung_id
                WHERE sm.name = ?
            `).all(req.params.sammlung)
            : db.prepare("SELECT * FROM Songs").all();

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});
