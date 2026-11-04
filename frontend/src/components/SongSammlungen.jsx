import { Link } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "./AppContext";
import { addSammlung, addSongToSammlung, deleteSongFromSammlung } from "../helper/api";
import UpdateZuordnung from "./UpdateZuordnung";

const sammlungTexts = {
    button: 'Sammlungen ändern',
    title: 'Sammlungen bearbeiten',
    placeholder: 'Sammlung suchen oder neu anlegen',
    create: (name) => `„${name}“ als neue Sammlung anlegen`,
    notFound: 'Keine Sammlung gefunden.',
    empty: 'Noch keine Sammlungen vorhanden.',
};

// Abschnitt „Sammlungen“ der Song-Detailseite.
// onChanged wird nach dem Speichern aufgerufen, damit die Seite den Song neu lädt.
export default function SongSammlungen({ song, onChanged }) {
    const { sammlungen, setSammlungen } = useContext(AppContext);

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
        await onChanged();
    };

    return (
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
            {song.sammlungen.length > 0 ? (
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
    );
}
