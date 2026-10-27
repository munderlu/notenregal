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
        <section className="SongList">
            <h2 className="section-title">Alle Songs</h2>
            {error && <p className="alert" role="alert">{error}</p>}
            <div className="search">
                <input
                    type="text"
                    placeholder="Suche nach Songtitel oder Komponist"
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                    className="search__input"
                    value={searchTerm}
                />
                {searchTerm && (
                    <button className="search__clear" onClick={() => setSearchTerm("")} aria-label="Suche löschen">×</button>
                )}
            </div>
            <ul className="item-list">
                {filteredSongs.map((song) => (
                    <li key={song.song_id} className="item">
                        <div className="item__info">
                            <span className="item__title">{song.title}</span>
                            {song.composer ? <span className="item__subtitle">{song.composer}</span> : null}
                        </div>
                        <div className="item__actions">
                            <UpdateDialogue fields={songFields} initialValues={song} onSave={(values) => handleUpdateSong(song.song_id, values)} />
                            <button className="btn btn--danger" onClick={() => handleDeleteSong(song.song_id)}>Löschen</button>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
};
