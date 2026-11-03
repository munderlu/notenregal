import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "./AppContext";
import { getSongDetails, updateSong, addSammlung, addSongToSammlung, deleteSongFromSammlung } from "../helper/api";
import UpdateDialogue from "./UpdateDialogue";
import UpdateZuordnung from "./UpdateZuordnung";
import { songFields } from "./SongList";

const sammlungTexts = {
    button: 'Sammlungen ändern',
    title: 'Sammlungen bearbeiten',
    placeholder: 'Sammlung suchen oder neu anlegen',
    create: (name) => `„${name}“ als neue Sammlung anlegen`,
    notFound: 'Keine Sammlung gefunden.',
    empty: 'Noch keine Sammlungen vorhanden.',
};

export default function SongDetails() {
    const { song_id } = useParams();
    const [song, setSong] = useState({});
    const [error, setError] = useState(null);

    const { setSongs, sammlungen, setSammlungen } = useContext(AppContext);

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

    const handleCreateSammlung = async (name) => {
        const neueSammlung = await addSammlung({ name });

        setSammlungen(prev => [...prev, neueSammlung].sort((a, b) => a.name.localeCompare(b.name, 'de')));
        return neueSammlung.sammlung_id;
    };

    const handleSaveSammlungen = async (toAdd, toDelete) => {
        await Promise.all([
            ...toAdd.map(id => addSongToSammlung(song.song_id, id)),
            ...toDelete.map(id => deleteSongFromSammlung(song.song_id, id)),
        ]);
        await loadSongData();
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
                        />
                    </header>

                    <section className="detail__section">
                        <div className="detail__section-header">
                            <h2 className="section-title">Sammlungen</h2>
                            <UpdateZuordnung
                                items={sammlungen.map(s => ({ id: s.sammlung_id, label: s.name }))}
                                initialIds={song.sammlungen.map(s => s.sammlung_id)}
                                onCreate={handleCreateSammlung}
                                onSave={handleSaveSammlungen}
                                texts={sammlungTexts}
                            />
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
