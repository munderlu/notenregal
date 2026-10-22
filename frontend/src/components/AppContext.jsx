import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
    const [songs, setSongs] = useState([]);
    const [error, setError] = useState(null);
    const [sammlungen, setSammlungen] = useState([]);


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

    const value = { songs, setSongs, sammlungen, setSammlungen, error, setError };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
