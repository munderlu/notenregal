// backend/src/webdav.js
import { createClient } from 'webdav';
import 'dotenv/config';

export const webdavClient = createClient(
    process.env.WEBDAV_URL,
    {
        username: process.env.WEBDAV_USER,
        password: process.env.WEBDAV_PASSWORD
    }
);

// Pfad der PDF im WebDAV
export const notenPfad = (noten_id) => `Notenfiles/${noten_id}.pdf`;

// Löscht die PDF einer Note. Eine bereits fehlende Datei gilt nicht als Fehler.
export async function deleteNotenFile(noten_id) {
    try {
        await webdavClient.deleteFile(notenPfad(noten_id));
    } catch (error) {
        if (error?.status !== 404) throw error;
    }
}
