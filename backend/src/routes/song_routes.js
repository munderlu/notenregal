import { Router } from "express";
import { getDb } from "../db/index.js";
import { deleteNotenFile } from "../webdav.js";

export const songsRouter = Router();

// ---------------------------------- Songs ---------------------------------------------

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

songsRouter.delete("/:song_id", async (req, res) => {
    try {
        const { song_id } = req.params;
        const db = getDb();
        const existingSong = db.prepare("SELECT * FROM Songs WHERE song_id = ?").get(song_id);
        if (!existingSong) {
            return res.status(404).json({ error: "Song nicht gefunden" });
        }
        // IDs merken, bevor die Noten per ON DELETE CASCADE mitgelöscht werden
        const notenIds = db
            .prepare("SELECT noten_id FROM Noten WHERE song_id = ?")
            .all(song_id)
            .map(n => n.noten_id);

        db.prepare("DELETE FROM Songs WHERE song_id = ?").run(song_id);

        // PDFs im WebDAV entfernen. Der Song ist dann schon gelöscht –
        // schlägt eine Datei fehl, wird das nur protokolliert.
        const results = await Promise.allSettled(notenIds.map(deleteNotenFile));
        results.forEach((r, i) => {
            if (r.status === 'rejected') {
                console.error(`PDF für Noten ${notenIds[i]} konnte nicht gelöscht werden:`, r.reason);
            }
        });

        res.status(204).send();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});

songsRouter.get("/:song_id", (req, res) => {
    try {
        const { song_id } = req.params;
        const db = getDb();
        const loadedSong = db.prepare("SELECT * FROM Songs WHERE song_id = ?").get(song_id);

        if (!loadedSong) {
            return res.status(404).json({ error: "Song nicht gefunden" });
        }

        const sammlungen = db.prepare(`
            SELECT sa.sammlung_id, sa.name
            FROM Song_Sammlung ss
            JOIN Sammlungen sa ON ss.sammlung_id = sa.sammlung_id
            WHERE ss.song_id = ?
            ORDER BY sa.name;
        `).all(song_id);

        res.status(200).json({
            ...loadedSong,
            sammlungen
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});

