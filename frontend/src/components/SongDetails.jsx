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
                <>
                    <header className="detail__header">
                        <h1 className="page-title">{song.title}</h1>
                        {song.composer && <p className="detail__subtitle">{song.composer}</p>}
                    </header>

                    <section className="detail__section">
                        <div className="detail__section-header">
                            <h2 className="section-title">Sammlungen</h2>
                            <UpdateSammlungSong song={song} onSaved={loadSongData} />
                        </div>
                        {song.sammlungen?.length > 0 ? (
                            <ul className="chip-list">
                                {song.sammlungen.map(sammlung => (
                                    <li key={sammlung.sammlung_id}>
                                        <Link to={`/sammlungen/${sammlung.sammlung_id}`} className="chip">
                                            {sammlung.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="detail__empty">Dieser Song ist noch in keiner Sammlung.</p>
                        )}
                    </section>
                </>
            )}
        </article>
    );
}
