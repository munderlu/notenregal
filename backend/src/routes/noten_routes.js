import { Router } from "express";
import { getDb } from "../db/index.js";
import { createClient } from 'webdav';
import multer from 'multer';
import 'dotenv/config';

export const notenRouter = Router();

const webdavClient = createClient(
    process.env.WEBDAV_URL,
    {
        username: process.env.WEBDAV_USER,
        password: process.env.WEBDAV_PASSWORD
    }
);

const upload = multer({ storage: multer.memoryStorage() });

// ---------------------------------- Noten ---------------------------------------------

notenRouter.get("/:song_id", (req, res) => {
    try {
        const db = getDb();

        const { song_id } = req.params;

        const noten = db
            .prepare('SELECT * FROM Noten WHERE song_id = ?')
            .all(song_id);

        res.status(200).json(noten);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});

notenRouter.post('/upload/:song_id', upload.single('pdfFile'), async (req, res) => {
    const { song_id } = req.params;
    const { instrument } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'Keine Datei hochgeladen oder falsches Format.' });
    }

    let noten_id;
    try {
        const db = getDb();

        if (!instrument) {
            console.error("Instrument nötig.");
            res.status(400).json({ error: 'Instument ist nicht gesetzt.' });
        }

        const result = db
            .prepare("INSERT INTO Noten (song_id, instrument) VALUES (?, ?)")
            .run(song_id, instrument ?? null);
        noten_id = result.lastInsertRowid;

        const dateiBuffer = req.file.buffer;

        // Datei-Buffer direkt zu WebDAV senden
        await webdavClient.putFileContents(`Notenfiles/${noten_id}.pdf`, dateiBuffer);

        res.status(201).json({
            noten_id: noten_id,
            song_id: Number(song_id),
            instrument: instrument ?? null,
            pdf_link: notenUrl(noten_id),
        });
    } catch (error) {
        console.error('Upload-Fehler:', error);
        if (noten_id) {
            db.prepare("DELECT FROM NOTEN WHERE noten_id = ?").run(noten_id);
        }
        res.status(500).json({ error: 'Fehler beim WebDAV-Upload: ' });
    }
});
