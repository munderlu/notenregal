import { useContext } from 'react';
import { AppContext } from './AppContext';
import { deleteSong } from '../helper/songsHelper';
import UpdateDialogue from './UpdateDialogue';

export default function SongList() {
    const { songs, setSongs, error, setError } = useContext(AppContext);

    return (
        <div className="SongList">
            <h1>Song List</h1>
            {error && <p role="alert">{error}</p>}
            <ul>
                {songs.map((song) => (
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
