// backend/src/routes/api_routes.js
import { Router } from "express";
import { getDb } from "../db/index.js";

export const apiRouter = Router();

// Songs

// Alle Songs
apiRouter.get("/songs", (req, res) => {
    try {
        const db = getDb();
        const rows = db.prepare("SELECT * FROM Songs ORDER BY title").all();

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
