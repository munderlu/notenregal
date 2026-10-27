import { useContext, useState } from 'react';
import { AppContext } from './AppContext';
import UpdateDialogue from './UpdateDialogue';
import { updateSong, deleteSong } from '../helper/api';

const songFields = [
    { name: 'title', label: 'Titel', type: 'text', required: true },
    { name: 'composer', label: 'Komponist', type: 'text', required: false },
];

export default function SongList() {
    const { songs, setSongs, error, setError } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSongs = songs.filter((song) => {
        const titleMatch = song.title.toLowerCase().includes(searchTerm.toLowerCase());
        const composerMatch = song.composer && song.composer.toLowerCase().includes(searchTerm.toLowerCase());
        return titleMatch || composerMatch;
    }).sort(
        (a, b) => a.title.localeCompare(b.title, 'de')
    );

    const handleUpdateSong = async (song_id, values) => {
        try {
            const updatedSong = await updateSong(song_id, values);

            setSongs(prev => prev.map(
                song => song.song_id === song_id ? updatedSong : song
            ));

            setError(null);
        } catch (err) {
            setError('Error updating Song');
        }
    }

    const handleDeleteSong = async (song_id) => {
        try {
            const answer = await deleteSong(song_id);

            if (answer) {
                setSongs(prev => prev.filter(
                    song => song.song_id !== song_id
                ));
            }
        } catch (err) {
            setError('Error deleting Song');
        }
    }

    return (
        <div className="SongList">
            <h1>Song List</h1>
            {error && <p role="alert">{error}</p>}
            <div className='suche'>
                <input
                    type="text"
                    placeholder="Suche nach Songtitel oder Komponist"
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                    className="search-input"
                    value={searchTerm}
                />
                <button onClick={() => setSearchTerm("")}>Löschen</button>
            </div>
            <ul>
                {filteredSongs.map((song) => (
                    <li key={song.song_id}>
                        {song.title}
                        {song.composer ? <em> – {song.composer}</em> : null}
                        <br /><button onClick={() => handleDeleteSong(song.song_id)}>Löschen</button>
                        <br /><UpdateDialogue fields={songFields} initialValues={song} onSave={(values) => handleUpdateSong(song.song_id, values)} />
                    </li>
                ))}
            </ul>
        </div>
    );
};
