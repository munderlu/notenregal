import { useContext, useState } from 'react';
import { AppContext } from './AppContext';
import { deleteSong } from '../helper/songsHelper';
import UpdateDialogue from './UpdateDialogue';

export default function SongList() {
    const { songs, setSongs, error, setError } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSongs = songs.filter((song) => {
        const titleMatch = song.title.toLowerCase().includes(searchTerm.toLowerCase());
        const composerMatch = song.composer && song.composer.toLowerCase().includes(searchTerm.toLowerCase());
        return titleMatch || composerMatch;
    });

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
                        <br /><UpdateDialogue song={song} />
                    </li>
                ))}
            </ul>
        </div>
    );
};
