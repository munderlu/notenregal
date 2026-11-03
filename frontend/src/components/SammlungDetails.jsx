import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "./AppContext";
import { getSammlungDetails, updateSong, deleteSong, deleteSongFromSammlung } from "../helper/api";
import UpdateDialogue from "./UpdateDialogue";
import UpdateSongSammlung from "./UpdateSongSammlung";
import { songFields } from "./SongList";

export default function SammlungDetails() {
    const { sammlung_id } = useParams();
    const [sammlung, setSammlung] = useState({});
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { setSongs } = useContext(AppContext);

    const loadSammlungData = async () => {
        try {
            const loadedSammlung = await getSammlungDetails(sammlung_id);

            setSammlung(loadedSammlung);
        } catch (err) {
            setError('Sammlung wurde nicht gefunden');
        }
    };

    useEffect(() => {
        loadSammlungData();
    }, [sammlung_id]);

    // Songs nur in dieser Seite (lokal) ändern, ohne alles neu zu laden
    const updateLocalSongs = (updater) => {
        setSammlung(prev => ({ ...prev, songs: updater(prev.songs) }));
    };

    const handleUpdateSong = async (song_id, values) => {
        try {
            const updatedSong = await updateSong(song_id, values);

            updateLocalSongs(songs => songs.map(
                song => song.song_id === song_id ? { ...song, ...updatedSong } : song
            ));
            setSongs(prev => prev.map(
                song => song.song_id === song_id ? updatedSong : song
            ));
            setError(null);
        } catch (err) {
            setError('Song konnte nicht aktualisiert werden.');
            throw err; // Dialog bleibt bei Fehler offen
        }
    };

    const handleRemoveSong = async (song_id) => {
        try {
            await deleteSongFromSammlung(song_id, sammlung.sammlung_id);

            updateLocalSongs(songs => songs.filter(song => song.song_id !== song_id));
            setError(null);
        } catch (err) {
            setError('Song konnte nicht aus der Sammlung entfernt werden.');
        }
    };

    const handleDeleteSong = async (song_id) => {
        try {
            const answer = await deleteSong(song_id);

            if (answer) {
                updateLocalSongs(songs => songs.filter(song => song.song_id !== song_id));
                setSongs(prev => prev.filter(song => song.song_id !== song_id));
                setError(null);
            }
        } catch (err) {
            setError('Song konnte nicht gelöscht werden.');
        }
    };

    const search = searchTerm.trim().toLowerCase();
    const filteredSongs = (sammlung.songs || []).filter(song =>
        song.title.toLowerCase().includes(search) ||
        song.composer?.toLowerCase().includes(search)
    );

    const songCount = sammlung.songs?.length ?? 0;

    return (
        <article className="detail">
            <Link to="/sammlungen" className="back-link">← Alle Sammlungen</Link>
            {error && <p className="alert" role="alert">{error}</p>}
            {sammlung.name && (
                <>
                    <header className="detail__header">
                        <h1 className="page-title">{sammlung.name}</h1>
                        <p className="detail__subtitle">
                            {songCount === 1 ? '1 Song' : `${songCount} Songs`}
                        </p>
                    </header>

                    <section className="detail__section">
                        <div className="detail__section-header">
                            <h2 className="section-title">Songs</h2>
                            <UpdateSongSammlung sammlung={sammlung} onSaved={loadSammlungData} />
                        </div>

                        {songCount > 0 ? (
                            <>
                                <div className="search">
                                    <input
                                        type="text"
                                        className="search__input"
                                        placeholder="Suche nach Songtitel oder Komponist"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button type="button" className="search__clear" onClick={() => setSearchTerm('')} aria-label="Suche löschen">×</button>
                                    )}
                                </div>

                                <ul className="item-list">
                                    {filteredSongs.map(song => (
                                        <li key={song.song_id} className="item">
                                            <Link to={`/songs/${song.song_id}`} className="item__link">
                                                <div className="item__info">
                                                    <span className="item__title">{song.title}</span>
                                                    {song.composer && <span className="item__subtitle">{song.composer}</span>}
                                                </div>
                                            </Link>
                                            <div className="item__actions">
                                                <UpdateDialogue
                                                    fields={songFields}
                                                    initialValues={song}
                                                    onSave={(values) => handleUpdateSong(song.song_id, values)}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn--secondary"
                                                    onClick={() => handleRemoveSong(song.song_id)}
                                                    title="Nur aus dieser Sammlung entfernen"
                                                >
                                                    Entfernen
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn--danger"
                                                    onClick={() => handleDeleteSong(song.song_id)}
                                                    title="Song komplett löschen"
                                                >
                                                    Löschen
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                    {filteredSongs.length === 0 && (
                                        <li className="item item--empty">Kein Song gefunden.</li>
                                    )}
                                </ul>
                            </>
                        ) : (
                            <p className="detail__empty">In dieser Sammlung sind noch keine Songs.</p>
                        )}
                    </section>
                </>
            )}
        </article>
    );
}
