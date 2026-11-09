import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "./AppContext";
import { getSongDetails, updateSong, deleteSong } from "../helper/api";
import UpdateDialogue from "./UpdateDialogue";
import { songFields } from "./SongList";
import SongSammlungen from "./SongSammlungen";
import SongNoten from "./SongNoten";
import { ChevronLeftIcon } from "./Icons";

export default function SongDetails() {
    const { song_id } = useParams();
    const [song, setSong] = useState({});
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const { setSongs } = useContext(AppContext);

    const loadSongData = async () => {
        try {
            const loadedSong = await getSongDetails(song_id);

            setSong(loadedSong);
            setError(null);
        } catch (err) {
            setError('Diesen Song gibt es nicht (mehr).');
        }
    };

    useEffect(() => {
        loadSongData();
    }, [song_id]);

    // Titel/Komponist des aktuellen Songs bearbeiten
    const handleUpdateSong = async (values) => {
        const updatedSong = await updateSong(song.song_id, values);

        setSong(prev => ({ ...prev, ...updatedSong }));
        setSongs(prev => prev.map(
            s => s.song_id === updatedSong.song_id ? updatedSong : s
        ));
    };

    const handleDeleteSong = async () => {
        await deleteSong(song.song_id);

        setSongs(prev => prev.filter(s => s.song_id !== song.song_id));
        navigate('/songs');
    };

    return (
        <article className="detail">
            <Link to="/songs" className="back-link"><ChevronLeftIcon size={16} />Songs</Link>
            {error && <p className="alert" role="alert">{error}</p>}
            {song.title && (
                <>
                    <header className="detail__header">
                        <div className="detail__header-text">
                            <h1 className="detail__title">{song.title}</h1>
                            {song.composer && <p className="detail__subtitle">{song.composer}</p>}
                        </div>
                        <UpdateDialogue
                            fields={songFields}
                            initialValues={{ title: song.title, composer: song.composer }}
                            onSave={handleUpdateSong}
                            title="Song bearbeiten"
                            onDelete={handleDeleteSong}
                            deleteText={{
                                button: 'Song löschen',
                                confirm: 'Song mit allen Noten löschen? Er verschwindet auch aus allen Sammlungen.',
                            }}
                        />
                    </header>

                    <SongNoten song_id={song.song_id} />
                    <SongSammlungen song={song} onChanged={loadSongData} />
                </>
            )}
        </article>
    );
}
