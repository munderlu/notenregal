import { useEffect, useState } from 'react'
import './App.css'

function App() {
    const [songs, setSongs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        fetch('/api/songs')
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then((data) => {
                if (!cancelled) setSongs(data.sort((a, b) => a.title.localeCompare(b.title)));
            })
            .catch((err) => {
                console.error('Error fetching songs:', err);
                if (!cancelled) setError('Songs konnten nicht geladen werden.');
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const addSong = async (e) => {
        e.preventDefault();
        const form = e.target;
        const title = form.elements.title.value;
        const composer = form.elements.composer.value;

        try {
            const response = await fetch('/api/songs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, composer }),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const newSong = await response.json();
            setSongs((prev) => [...prev, newSong].sort((a, b) => a.title.localeCompare(b.title)));
            setError(null);
            form.reset();
        } catch (err) {
            console.error('Error adding song:', err);
            setError('Song konnte nicht hinzugefügt werden.');
        }
    };

    return (
        <div className="App">
            <h1>Song List</h1>
            {error && <p role="alert">{error}</p>}
            <ul>
                {songs.map((song) => (
                    <li key={song.song_id}>
                        {song.title}
                        {song.composer ? <em> – {song.composer}</em> : null}
                    </li>
                ))}
            </ul>

            <h1>Song hinzufügen</h1>
            <form onSubmit={addSong}>
                <input type="text" name="title" placeholder="Song Titel" required />
                <input type="text" name="composer" placeholder="Komponist (optional)" />
                <button type="submit">Hinzufügen</button>
            </form>
        </div>
    )
}

export default App
