import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getSongDetails } from "../helper/api";
import UpdateSammlungSong from "./UpdateSammlungSong";

export default function SongDetails() {
    const { song_id } = useParams();
    const [song, setSong] = useState({});
    const [error, setError] = useState(null);

    const loadSongData = async () => {
        try {
            const loadedSong = await getSongDetails(song_id);

            setSong(loadedSong);
        } catch (err) {
            setError('Song wurde nicht gefunden');
        }
    };

    useEffect(() => {
        loadSongData();
    }, [song_id]);

    return (
        <article className="detail">
            <Link to="/songs" className="back-link">← Alle Songs</Link>
            {error && <p className="alert" role="alert">{error}</p>}
            {song.title && (
                <header className="detail__header">
                    <h1 className="page-title">{song.title}</h1>
                    {song.composer && <p className="detail__subtitle">{song.composer}</p>}
                    <p className="detail__subtitle">
                        Sammlungen: {song.sammlungen.map((sammlung, index) => (
                            <span key={index}>
                                <Link to={`/sammlungen/${sammlung.sammlung_id}`}>{sammlung.name}</Link>{index < song.sammlungen.length - 1 ? ', ' : ''}
                            </span>
                        ))}
                    </p>
                    <UpdateSammlungSong
                        song={song}
                        onSaved={loadSongData}
                    />
                </header>
            )}
        </article>
    );
}
