import { Router } from "express";
import { getDb } from "../db/index.js";

export const sammlungsRouter = Router();

// ------------------------------ Sammlungen -------------------------------

sammlungsRouter.get("/", (req, res) => {
    try {
        const db = getDb();
        const rows = db.prepare("SELECT * FROM Sammlungen ORDER BY name").all();

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});

sammlungsRouter.post("/", (req, res) => {
    try {
        const { name: name } = req.body ?? {};
        if (typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({ error: "Name ist erforderlich" });
        }

        const db = getDb();
        const result = db
            .prepare("INSERT INTO Sammlungen (name) VALUES (?)")
            .run(name.trim());
        const newSammlung = db.prepare("SELECT * FROM Sammlungen WHERE sammlung_id = ?").get(result.lastInsertRowid);
        res.status(201).json(newSammlung);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});

sammlungsRouter.put("/:sammlung_id", (req, res) => {
    try {
        const { sammlung_id: sammlung_id } = req.params;
        const { name: name } = req.body ?? {};
        const db = getDb();
        const existingSammlung = db.prepare("SELECT * FROM Sammlungen WHERE sammlung_id = ?").get(sammlung_id);
        if (!existingSammlung) {
            return res.status(404).json({ error: "Sammlung nicht gefunden" });
        }
        const updateQuery = db.prepare("UPDATE Sammlungen SET name = ? WHERE sammlung_id = ?");
        updateQuery.run(name ?? existingSammlung.name, sammlung_id);

        const updatedSammlung = db.prepare("SELECT * FROM Sammlungen WHERE sammlung_id = ?").get(sammlung_id);
        res.status(200).json(updatedSammlung);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});

sammlungsRouter.delete("/:sammlung_id", (req, res) => {
    try {
        const { sammlung_id: sammlung_id } = req.params;
        const db = getDb();
        const existingSammlung = db.prepare("SELECT * FROM Sammlungen WHERE sammlung_id = ?").get(sammlung_id);
        if (!existingSammlung) {
            return res.status(404).json({ error: "Sammlung nicht gefunden" });
        }
        db.prepare("DELETE FROM Sammlungen WHERE sammlung_id = ?").run(sammlung_id);
        res.status(204).send();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});

sammlungsRouter.get("/:sammlung_id", (req, res) => {
    try {
        const { sammlung_id } = req.params;
        const db = getDb();
        const loadedSammlung = db.prepare("SELECT * FROM Sammlungen WHERE sammlung_id = ?").get(sammlung_id);

        if (!loadedSammlung) {
            return res.status(404).json({ error: "Sammlung nicht gefunden" });
        }

        const songs = db.prepare(`
            SELECT so.song_id, so.title, so.composer
            FROM Song_Sammlung ss
            JOIN Songs so ON ss.song_id = so.song_id
            WHERE ss.sammlung_id = ?
            ORDER BY so.title;
        `).all(sammlung_id);

        res.status(200).json({
            ...loadedSammlung,
            songs
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});

// ------------------------------------- Song_Sammlung --------------------------------

sammlungsRouter.put("/:sammlung_id/songs/:song_id", (req, res) => {
    try {
        const { sammlung_id, song_id } = req.params;
        const db = getDb();
        const existingSammlung = db.prepare("SELECT 1 FROM Sammlungen WHERE sammlung_id = ?").get(sammlung_id);
        const existingSong = db.prepare("SELECT 1 FROM Songs WHERE song_id = ?").get(song_id);

        if (!existingSammlung) {
            return res.status(404).json({ error: "Sammlung nicht gefunden" });
        }
        if (!existingSong) {
            return res.status(404).json({ error: "Song nicht gefunden" });
        }

        db.prepare(`
            INSERT INTO Song_Sammlung (song_id, sammlung_id)
            VALUES (?, ?)
            ON CONFLICT (song_id, sammlung_id) DO NOTHING;
        `).run(song_id, sammlung_id);

        return res.status(204).send();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});

sammlungsRouter.delete("/:sammlung_id/songs/:song_id", (req, res) => {
    try {
        const { sammlung_id, song_id } = req.params;
        const db = getDb();

        db.prepare(`
            DELETE FROM Song_Sammlung
            WHERE song_id = ?
            AND sammlung_id = ?;
        `).run(song_id, sammlung_id);

        return res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});
