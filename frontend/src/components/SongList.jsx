import { useContext, useState } from 'react';
import { AppContext } from './AppContext';
import { deleteSong } from '../helper/songsHelper';
import UpdateDialogue from './UpdateDialogue';

const updateSong = async (song_id, values, setSongs, setError) => {
    try {
        const response = await fetch(`/api/songs/${song_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const updatedSong = await response.json();

        setSongs((prev) => prev.map((song) => (song.song_id === updatedSong.song_id ? updatedSong : song)).sort((a, b) => a.title.localeCompare(b.title)));

        setError(null);
    }
    catch (err) {
        console.error('Error updating song:', err);
        setError('Song konnte nicht aktualisiert werden.');
    }
}

export default function SongList() {
    const { songs, setSongs, error, setError } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSongs = songs.filter((song) => {
        const titleMatch = song.title.toLowerCase().includes(searchTerm.toLowerCase());
        const composerMatch = song.composer && song.composer.toLowerCase().includes(searchTerm.toLowerCase());
        return titleMatch || composerMatch;
    });

    const songFields = [
        { name: 'title', label: 'Titel', type: 'text', required: true },
        { name: 'composer', label: 'Komponist', type: 'text', required: false },
    ];

    return (
        <div className="SongList">
            <h1>Song List</h1>
            {error && <p role="alert">{error}</p>}
            <input
                type="text"
                placeholder="Suche nach Songtitel oder Komponist"
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                }}
                className="search-input"
            />
            <ul>
                {filteredSongs.map((song) => (
                    <li key={song.song_id}>
                        {song.title}
                        {song.composer ? <em> – {song.composer}</em> : null}
                        <br /><button onClick={() => deleteSong(song.song_id, setSongs, setError)}>Löschen</button>
                        <br /><UpdateDialogue fields={songFields} initialValues={song} onSave={(values) => updateSong(song.song_id, values, setSongs, setError)} />
                    </li>
                ))}
            </ul>
        </div>
    );
};
