// backend/src/routes/api_routes.js
import { Router } from "express";
import { getDb } from "../db/index.js";

export const songsRouter = Router();

// Songs

// Alle Songs
songsRouter.get("/", (req, res) => {
    try {
        const db = getDb();
        const rows = db.prepare("SELECT * FROM Songs ORDER BY title").all();

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});

songsRouter.post("/", (req, res) => {
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

songsRouter.put("/:song_id", (req, res) => {
    try {
        const { song_id } = req.params;
        const { title, composer } = req.body ?? {};
        const db = getDb();
        const existingSong = db.prepare("SELECT * FROM Songs WHERE song_id = ?").get(song_id);
        if (!existingSong) {
            return res.status(404).json({ error: "Song nicht gefunden" });
        }
        const updateQuery = db.prepare("UPDATE Songs SET title = ?, composer = ? WHERE song_id = ?");
        updateQuery.run(title ?? existingSong.title, composer ?? existingSong.composer, song_id);

        const updatedSong = db.prepare("SELECT * FROM Songs WHERE song_id = ?").get(song_id);
        res.status(200).json(updatedSong);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});

songsRouter.delete("/:song_id", (req, res) => {
    try {
        const { song_id } = req.params;
        const db = getDb();
        const existingSong = db.prepare("SELECT * FROM Songs WHERE song_id = ?").get(song_id);
        if (!existingSong) {
            return res.status(404).json({ error: "Song nicht gefunden" });
        }
        db.prepare("DELETE FROM Songs WHERE song_id = ?").run(song_id);
        res.status(204).send();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});
