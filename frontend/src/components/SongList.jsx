import { useContext } from 'react';
import { AppContext } from './AppContext';
import { deleteSong } from '../helper/songsHelper';

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
                        <br></br><button onClick={() => deleteSong(song.song_id, setSongs, setError)}>Löschen</button>
                        <br></br><button onClick={() => window.location.href = `/edit/${song.song_id}`}>Bearbeiten</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
