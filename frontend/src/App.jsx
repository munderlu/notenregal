import { useEffect, useState } from 'react'
import './App.css'
import SongList from './components/SongList'
import AddSong from './components/AddSong'
import { AppContext } from './components/AppContext'

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


    return (
        <AppContext.Provider value={{ songs, setSongs, error, setError }}>
            <div className="App">
                <SongList />
                <AddSong />
            </div>
        </AppContext.Provider>
    )
}

export default App
