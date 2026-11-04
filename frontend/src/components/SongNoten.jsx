import { useState, useEffect } from "react";
import { getNoten, getNotenUrl, updateNoten, deleteNoten } from "../helper/api";
import UpdateDialogue from "./UpdateDialogue";
import UploadNoten from "./UploadNoten";
import { DownloadIcon, TrashIcon } from "./Icons";

const notenFields = [
    { name: 'instrument', label: 'Instrument', type: 'text', required: true },
];

const sortNoten = (noten) => [...noten].sort((a, b) => a.instrument.localeCompare(b.instrument, 'de'));

// Abschnitt „Noten“ der Song-Detailseite: Liste, Upload, Bearbeiten, Download, Löschen
export default function SongNoten({ song_id }) {
    const [noten, setNoten] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadNoten = async () => {
            try {
                setNoten(sortNoten(await getNoten(song_id)));
                setError(null);
            } catch (err) {
                setError('Noten konnten nicht geladen werden.');
            }
        };
        loadNoten();
    }, [song_id]);

    const handleUploaded = (neueNoten) => {
        setNoten(prev => sortNoten([...prev, neueNoten]));
        setError(null);
    };

    const handleUpdateNoten = async (noten_id, values) => {
        try {
            const updated = await updateNoten(noten_id, values);

            setNoten(prev => sortNoten(prev.map(n => n.noten_id === noten_id ? updated : n)));
            setError(null);
        } catch (err) {
            setError('Noten konnten nicht aktualisiert werden.');
            throw err; // Dialog bleibt bei Fehler offen
        }
    };

    const handleDeleteNoten = async (noten_id) => {
        try {
            const answer = await deleteNoten(noten_id);

            if (answer) {
                setNoten(prev => prev.filter(n => n.noten_id !== noten_id));
                setError(null);
            }
        } catch (err) {
            setError('Noten konnten nicht gelöscht werden.');
        }
    };

    return (
        <section className="detail__section">
            <div className="detail__section-header">
                <h2 className="section-title">Noten</h2>
                <UploadNoten song_id={song_id} onUploaded={handleUploaded} />
            </div>
            {error && <p className="alert" role="alert">{error}</p>}
            {noten.length > 0 ? (
                <ul className="item-list">
                    {noten.map(n => (
                        <li key={n.noten_id} className="item">
                            <a
                                href={getNotenUrl(n.noten_id)}
                                target="_blank"
                                rel="noreferrer"
                                className="item__link"
                            >
                                <div className="item__info">
                                    <span className="item__title">{n.instrument}</span>
                                    <span className="item__subtitle">PDF öffnen</span>
                                </div>
                            </a>
                            <div className="item__actions">
                                <UpdateDialogue
                                    fields={notenFields}
                                    initialValues={{ instrument: n.instrument }}
                                    onSave={(values) => handleUpdateNoten(n.noten_id, values)}
                                    label={`Instrument „${n.instrument}“ bearbeiten`}
                                />
                                <a
                                    href={getNotenUrl(n.noten_id, true)}
                                    className="btn btn--secondary btn--icon"
                                    aria-label={`Noten für ${n.instrument} herunterladen`}
                                    title="Herunterladen"
                                >
                                    <DownloadIcon />
                                </a>
                                <button
                                    type="button"
                                    className="btn btn--danger btn--icon"
                                    onClick={() => handleDeleteNoten(n.noten_id)}
                                    aria-label={`Noten für ${n.instrument} löschen`}
                                    title="Noten löschen"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="detail__empty">Für diesen Song sind noch keine Noten hochgeladen.</p>
            )}
        </section>
    );
}
