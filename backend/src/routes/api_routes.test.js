// backend/src/routes/api_routes.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { getDb } from '../db/index.js';

// Eigene, leere In-Memory-Datenbank für diesen Test (nur beim ersten Aufruf relevant).
getDb(':memory:');

describe('Songs-Routen', () => {
    beforeEach(() => {
        getDb().prepare('DELETE FROM Songs').run();
        getDb().prepare('DELETE FROM Song_Sammlung').run();
        getDb().prepare('DELETE FROM Sammlungen').run();
    });

    it('GET /api/songs liefert eine leere Liste', async () => {
        const res = await request(app).get('/api/songs');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('POST /api/songs legt einen Song an und liefert ihn zurück', async () => {
        const res = await request(app)
            .post('/api/songs')
            .send({ title: 'Für Elise', composer: 'Beethoven' });

        expect(res.status).toBe(201);
        expect(res.body.song_id).toBeGreaterThan(0);
        expect(res.body.title).toBe('Für Elise');
        expect(res.body.composer).toBe('Beethoven');
    });

    it('POST /api/songs speichert fehlenden Composer als NULL', async () => {
        const res = await request(app).post('/api/songs').send({ title: 'Ohne Komponist' });

        expect(res.status).toBe(201);
        expect(res.body.composer).toBeNull();
    });

    it('POST /api/songs antwortet mit 400, wenn der Titel fehlt', async () => {
        const res = await request(app).post('/api/songs').send({ composer: 'Niemand' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it('GET /api/songs/:sammlung filtert nach Sammlung', async () => {
        const db = getDb();
        const song = await request(app).post('/api/songs').send({ title: 'Chorlied' });
        const sammlung = db.prepare('INSERT INTO Sammlungen (name) VALUES (?)').run('Weihnachtschor');
        db.prepare('INSERT INTO Song_Sammlung (song_id, sammlung_id) VALUES (?, ?)')
            .run(song.body.song_id, sammlung.lastInsertRowid);

        const inSammlung = await request(app).get('/api/songs/Weihnachtschor');
        expect(inSammlung.status).toBe(200);
        expect(inSammlung.body).toHaveLength(1);
        expect(inSammlung.body[0].title).toBe('Chorlied');

        const ohneSammlung = await request(app).get('/api/songs/Gesangsverein');
        expect(ohneSammlung.status).toBe(200);
        expect(ohneSammlung.body).toEqual([]);
    });
});
