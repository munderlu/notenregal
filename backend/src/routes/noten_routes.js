import { Router } from "express";
import { getDb } from "../db/index.js";
import multer from 'multer';
import { webdavClient, notenPfad, deleteNotenFile } from "../webdav.js";

export const notenRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });

// ---------------------------------- Noten ---------------------------------------------

notenRouter.get("/:song_id", (req, res) => {
    try {
        const db = getDb();

        const { song_id } = req.params;

        const noten = db
            .prepare('SELECT * FROM Noten WHERE song_id = ? ORDER BY instrument')
            .all(song_id);

        res.status(200).json(noten);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});

notenRouter.post('/upload/:song_id', upload.single('pdfFile'), async (req, res) => {
    const { song_id } = req.params;
    const instrument = req.body?.instrument?.trim();

    if (!req.file || req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Keine Datei hochgeladen oder falsches Format.' });
    }
    if (!instrument) {
        return res.status(400).json({ error: 'Instrument ist nicht gesetzt.' });
    }

    const db = getDb();
    let noten_id;
    try {
        const song = db.prepare("SELECT song_id FROM Songs WHERE song_id = ?").get(song_id);
        if (!song) {
            return res.status(404).json({ error: 'Song nicht gefunden' });
        }

        const result = db
            .prepare("INSERT INTO Noten (song_id, instrument) VALUES (?, ?)")
            .run(song_id, instrument);
        noten_id = Number(result.lastInsertRowid);

        // Datei-Buffer direkt zu WebDAV senden
        await webdavClient.putFileContents(notenPfad(noten_id), req.file.buffer);

        res.status(201).json({
            noten_id,
            song_id: Number(song_id),
            instrument,
        });
    } catch (error) {
        console.error('Upload-Fehler:', error);
        // Datenbankeintrag zurückrollen, wenn der Upload fehlgeschlagen ist
        if (noten_id) {
            db.prepare("DELETE FROM Noten WHERE noten_id = ?").run(noten_id);
        }
        res.status(500).json({ error: 'Fehler beim WebDAV-Upload' });
    }
});

notenRouter.get('/download/:noten_id', async (req, res) => {
    const { noten_id } = req.params;

    try {
        const db = getDb();
        const noten = db.prepare(`
            SELECT n.noten_id, n.instrument, s.title
            FROM Noten n
            JOIN Songs s ON s.song_id = n.song_id
            WHERE n.noten_id = ?
        `).get(noten_id);

        if (!noten) {
            return res.status(404).json({ error: 'Noten nicht gefunden' });
        }

        const datei = await webdavClient.getFileContents(notenPfad(noten.noten_id));

        // Dateiname z. B. „Für Elise - Klavier.pdf“ (Sonderzeichen über filename* nach RFC 5987)
        const dateiname = `${noten.title} - ${noten.instrument}.pdf`.replace(/[\\/:*?"<>|]/g, '_');
        const asciiName = dateiname.replace(/[^\x20-\x7E]/g, '_');
        const art = req.query.download !== undefined ? 'attachment' : 'inline';

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `${art}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(dateiname)}`,
        });
        res.status(200).send(Buffer.from(datei));
    } catch (error) {
        console.error('Download-Fehler:', error);
        if (error?.status === 404) {
            return res.status(404).json({ error: 'PDF-Datei nicht gefunden' });
        }
        res.status(500).json({ error: 'Fehler beim WebDAV-Download' });
    }
});

notenRouter.put('/:noten_id', (req, res) => {
    const { noten_id } = req.params;
    const instrument = req.body?.instrument;

    if (typeof instrument !== 'string' || instrument.trim() === '') {
        return res.status(400).json({ error: 'Instrument ist erforderlich' });
    }

    try {
        const db = getDb();
        const result = db
            .prepare("UPDATE Noten SET instrument = ? WHERE noten_id = ?")
            .run(instrument.trim(), noten_id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Noten nicht gefunden' });
        }

        const updated = db.prepare("SELECT * FROM Noten WHERE noten_id = ?").get(noten_id);
        res.status(200).json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Datenbankfehler" });
    }
});

notenRouter.delete('/:noten_id', async (req, res) => {
    const { noten_id } = req.params;

    try {
        const db = getDb();
        const noten = db.prepare("SELECT * FROM Noten WHERE noten_id = ?").get(noten_id);

        if (!noten) {
            return res.status(404).json({ error: 'Noten nicht gefunden' });
        }

        // Erst die Datei löschen – schlägt das fehl, bleibt der Eintrag erhalten.
        await deleteNotenFile(noten.noten_id);

        db.prepare("DELETE FROM Noten WHERE noten_id = ?").run(noten.noten_id);
        res.status(204).send();
    } catch (error) {
        console.error('Lösch-Fehler:', error);
        res.status(500).json({ error: 'Fehler beim Löschen der Noten' });
    }
});
