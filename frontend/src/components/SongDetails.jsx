import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getSongDetails } from "../helper/api";

export default function SongDetails() {
    const { song_id } = useParams();
    const [song, setSong] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadSongData = async () => {
            try {
                const { title, composer } = await getSongDetails(song_id);

                setSong({ title, composer });
            } catch (err) {
                setError('Song wurde nicht gefunden');
            }
        };

        loadSongData();
    }, []);

    return (
        <>
            <Link to="/songs">Alle Songs</Link>
            <h1>{song.title}</h1>
            {song.composer && <p> {song.composer}</p>}
            {error && <p className="alert" role="alert">{error}</p>}
        </>
    );
}
