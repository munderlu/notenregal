import { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from './AppContext';

export default function UpdateDialogue({ song }) {
    const { setSongs, setError } = useContext(AppContext);

    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState(song.title);
    const [composer, setComposer] = useState(song.composer ?? '');

    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [isOpen]);

    const updateSong = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/songs/${song.song_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, composer }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const updatedSong = await response.json();

            setSongs((prevSongs) => prevSongs.map((songx) => (songx.song_id === song.song_id ? updatedSong : songx)));

            setIsOpen(false);

            setError(null);
        }
        catch (err) {
            console.error('Error updating song:', err);
            setError('Song konnte nicht aktualisiert werden.');
        }
    }

    return (
        <div className="UpdateDialogue">
            <button onClick={() => setIsOpen(true)}>Bearbeiten</button>
            <dialog ref={dialogRef} onClose={() => setIsOpen(false)}>
                <h2>Song updaten</h2>
                <form onSubmit={(e) => updateSong(e)}>
                    <input type="text" name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)} required />
                    <input type="text" name="composer"
                        value={composer}
                        onChange={(e) => setComposer(e.target.value)}
                    />
                    <button type="submit">Aktualisieren</button>
                    <button type="button" onClick={() => setIsOpen(false)}>Abbrechen</button>
                </form>
            </dialog>
        </div>
    )
}
