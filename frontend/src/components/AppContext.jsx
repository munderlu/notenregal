import { createContext, useState, useEffect } from 'react';
import { getAllSammlungen, getAllSongs } from '../helper/api';

export const AppContext = createContext();

export function AppProvider({ children }) {
    const [songs, setSongs] = useState([]);
    const [error, setError] = useState(null);
    const [sammlungen, setSammlungen] = useState([]);


    useEffect(() => {
        const loadData = async () => {
            try {
                const [songsResponse, sammlungenResponse] = await Promise.all([
                    getAllSongs(),
                    getAllSammlungen()
                ]);

                setSongs(songsResponse);
                setSammlungen(sammlungenResponse);
            } catch (err) {
                setError('Daten konnten nicht geladen werden.');
            }
        };

        loadData();
    }, []);

    const value = { songs, setSongs, sammlungen, setSammlungen, error, setError };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
