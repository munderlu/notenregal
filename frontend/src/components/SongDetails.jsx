import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "./AppContext";
import { getSongDetails, updateSong } from "../helper/api";
import UpdateDialogue from "./UpdateDialogue";
import { songFields } from "./SongList";
import SongSammlungen from "./SongSammlungen";
import SongNoten from "./SongNoten";

export default function SongDetails() {
    const { song_id } = useParams();
    const [song, setSong] = useState({});
    const [error, setError] = useState(null);

    const { setSongs } = useContext(AppContext);

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

    // Titel/Komponist des aktuellen Songs bearbeiten
    const handleUpdateSong = async (values) => {
        try {
            const updatedSong = await updateSong(song.song_id, values);

            setSong(prev => ({ ...prev, ...updatedSong }));
            setSongs(prev => prev.map(
                s => s.song_id === updatedSong.song_id ? updatedSong : s
            ));
            setError(null);
        } catch (err) {
            setError('Song konnte nicht aktualisiert werden.');
            throw err; // Dialog bleibt bei Fehler offen
        }
    };

    return (
        <article className="detail">
            <Link to="/songs" className="back-link">← Alle Songs</Link>
            {error && <p className="alert" role="alert">{error}</p>}
            {song.title && (
                <>
                    <header className="detail__header">
                        <div className="detail__header-text">
                            <h1 className="page-title">{song.title}</h1>
                            {song.composer && <p className="detail__subtitle">{song.composer}</p>}
                        </div>
                        <UpdateDialogue
                            fields={songFields}
                            initialValues={{ title: song.title, composer: song.composer }}
                            onSave={handleUpdateSong}
                            showLabel
                        />
                    </header>

                    <SongSammlungen song={song} onChanged={loadSongData} />
                    <SongNoten song_id={song.song_id} />
                </>
            )}
        </article>
    );
}
