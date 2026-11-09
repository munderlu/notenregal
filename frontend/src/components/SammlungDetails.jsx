import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "./AppContext";
import {
    getSammlungDetails, updateSammlung, deleteSammlung,
    addSong, addSongToSammlung, deleteSongFromSammlung,
} from "../helper/api";
import { einbandFarbe } from "../helper/einband";
import UpdateDialogue from "./UpdateDialogue";
import { ChevronLeftIcon, CloseIcon } from "./Icons";
import UpdateZuordnung from "./UpdateZuordnung";
import SearchField from "./SearchField";
import { filterSongs } from "./SongList";
import { sammlungFields } from "./SammlungenList";

const songTexts = {
    button: 'Songs zuordnen',
    title: 'Songs in dieser Sammlung',
    placeholder: 'Song suchen oder neu anlegen',
    create: (title) => `„${title}“ als neuen Song anlegen`,
    notFound: 'Kein Song gefunden.',
    empty: 'Noch keine Songs vorhanden.',
};

// Ab dieser Anzahl Songs lohnt sich ein Suchfeld
const SUCHE_AB = 8;

export default function SammlungDetails() {
    const { sammlung_id } = useParams();
    const [sammlung, setSammlung] = useState({});
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const { songs, setSongs, setSammlungen } = useContext(AppContext);

    const loadSammlungData = async () => {
        try {
            const loadedSammlung = await getSammlungDetails(sammlung_id);

            setSammlung(loadedSammlung);
            setError(null);
        } catch (err) {
            setError('Diese Sammlung gibt es nicht (mehr).');
        }
    };

    useEffect(() => {
        loadSammlungData();
    }, [sammlung_id]);

    const handleUpdateSammlung = async (values) => {
        const updatedSammlung = await updateSammlung(sammlung.sammlung_id, values);

        setSammlung(prev => ({ ...prev, ...updatedSammlung }));
        setSammlungen(prev => prev.map(
            s => s.sammlung_id === updatedSammlung.sammlung_id ? updatedSammlung : s
        ));
    };

    const handleDeleteSammlung = async () => {
        await deleteSammlung(sammlung.sammlung_id);

        setSammlungen(prev => prev.filter(s => s.sammlung_id !== sammlung.sammlung_id));
        navigate('/sammlungen');
    };

    const handleCreateSong = async (title) => {
        const neuerSong = await addSong({ title });

        setSongs(prev => [...prev, neuerSong]);
        return neuerSong.song_id;
    };

    const handleSaveSongs = async (toAdd, toDelete) => {
        await Promise.all([
            ...toAdd.map(id => addSongToSammlung(id, sammlung.sammlung_id)),
            ...toDelete.map(id => deleteSongFromSammlung(id, sammlung.sammlung_id)),
        ]);
        await loadSammlungData();
    };

    const handleRemoveSong = async (song_id) => {
        try {
            await deleteSongFromSammlung(song_id, sammlung.sammlung_id);

            setSammlung(prev => ({ ...prev, songs: prev.songs.filter(song => song.song_id !== song_id) }));
            setError(null);
        } catch (err) {
            setError('Song konnte nicht aus der Sammlung genommen werden.');
        }
    };

    const songCount = sammlung.songs?.length ?? 0;
    const filteredSongs = filterSongs(sammlung.songs || [], searchTerm);

    return (
        <article className="detail">
            <Link to="/sammlungen" className="back-link"><ChevronLeftIcon size={16} />Sammlungen</Link>
            {error && <p className="alert" role="alert">{error}</p>}
            {sammlung.name && (
                <>
                    <header
                        className="detail__header detail__header--einband"
                        style={{ '--einband': einbandFarbe(sammlung.sammlung_id) }}
                    >
                        <div className="detail__header-text">
                            <h1 className="detail__title">{sammlung.name}</h1>
                            <p className="detail__subtitle">
                                {songCount === 1 ? '1 Song' : `${songCount} Songs`}
                            </p>
                        </div>
                        <UpdateDialogue
                            fields={sammlungFields}
                            initialValues={{ name: sammlung.name }}
                            onSave={handleUpdateSammlung}
                            title="Sammlung bearbeiten"
                            onDelete={handleDeleteSammlung}
                            deleteText={{
                                button: 'Sammlung löschen',
                                confirm: 'Sammlung löschen? Die Songs und ihre Noten bleiben erhalten.',
                            }}
                        />
                    </header>

                    <section className="detail__section">
                        <div className="section-head">
                            <h2 className="section-title">Inhalt</h2>
                            <UpdateZuordnung
                                items={songs.map(s => ({ id: s.song_id, label: s.title, meta: s.composer }))}
                                initialIds={sammlung.songs.map(s => s.song_id)}
                                onCreate={handleCreateSong}
                                onSave={handleSaveSongs}
                                texts={songTexts}
                            />
                        </div>

                        {songCount >= SUCHE_AB && (
                            <SearchField
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="In dieser Sammlung suchen"
                                label="In dieser Sammlung suchen"
                            />
                        )}

                        {songCount > 0 ? (
                            <ul className="inhalt">
                                {filteredSongs.map(song => (
                                    <li key={song.song_id} className="inhalt__zeile">
                                        <Link to={`/songs/${song.song_id}`} className="inhalt__link">
                                            <span className="inhalt__titel">{song.title}</span>
                                            <span className="inhalt__punkte" aria-hidden="true" />
                                            {song.composer && <span className="inhalt__komponist">{song.composer}</span>}
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--icon inhalt__entfernen"
                                            onClick={() => handleRemoveSong(song.song_id)}
                                            aria-label={`„${song.title}“ aus der Sammlung nehmen`}
                                            title="Aus der Sammlung nehmen (der Song bleibt erhalten)"
                                        >
                                            <CloseIcon size={16} />
                                        </button>
                                    </li>
                                ))}
                                {filteredSongs.length === 0 && (
                                    <li className="leer">Kein Song passt zu „{searchTerm.trim()}“.</li>
                                )}
                            </ul>
                        ) : (
                            <p className="leer">Diese Sammlung ist noch leer. Über „Songs zuordnen“ fügst du Songs hinzu.</p>
                        )}
                    </section>
                </>
            )}
        </article>
    );
}
