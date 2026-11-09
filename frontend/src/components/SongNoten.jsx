import { useState, useEffect } from "react";
import { getNoten, getNotenUrl, updateNoten, deleteNoten } from "../helper/api";
import UpdateDialogue from "./UpdateDialogue";
import UploadNoten from "./UploadNoten";
import { DownloadIcon } from "./Icons";

const notenFields = [
    { name: 'instrument', label: 'Instrument', type: 'text', required: true },
];

const sortNoten = (noten) => [...noten].sort((a, b) => a.instrument.localeCompare(b.instrument, 'de'));

// Abschnitt „Noten“ der Song-Detailseite: ein PDF pro Instrument
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
        const updated = await updateNoten(noten_id, values);

        setNoten(prev => sortNoten(prev.map(n => n.noten_id === noten_id ? updated : n)));
    };

    const handleDeleteNoten = async (noten_id) => {
        await deleteNoten(noten_id);

        setNoten(prev => prev.filter(n => n.noten_id !== noten_id));
    };

    return (
        <section className="detail__section">
            <div className="section-head">
                <h2 className="section-title">
                    Noten {noten.length > 0 && <span className="section-count">{noten.length}</span>}
                </h2>
                <UploadNoten song_id={song_id} onUploaded={handleUploaded} />
            </div>
            {error && <p className="alert" role="alert">{error}</p>}
            {noten.length > 0 ? (
                <ul className="noten">
                    {noten.map(n => (
                        <li key={n.noten_id} className="noten__zeile">
                            <a
                                href={getNotenUrl(n.noten_id)}
                                target="_blank"
                                rel="noreferrer"
                                className="noten__link"
                                title={`Noten für ${n.instrument} öffnen`}
                            >
                                <span className="noten__blatt" aria-hidden="true" />
                                <span className="noten__instrument">{n.instrument}</span>
                            </a>
                            <div className="noten__aktionen">
                                <a
                                    href={getNotenUrl(n.noten_id, true)}
                                    className="btn btn--ghost btn--icon"
                                    aria-label={`Noten für ${n.instrument} herunterladen`}
                                    title="Herunterladen"
                                >
                                    <DownloadIcon />
                                </a>
                                <UpdateDialogue
                                    fields={notenFields}
                                    initialValues={{ instrument: n.instrument }}
                                    onSave={(values) => handleUpdateNoten(n.noten_id, values)}
                                    title="Noten bearbeiten"
                                    trigger="icon"
                                    label={`Noten für ${n.instrument} bearbeiten`}
                                    onDelete={() => handleDeleteNoten(n.noten_id)}
                                    deleteText={{
                                        button: 'Noten löschen',
                                        confirm: `Das PDF für ${n.instrument} wird endgültig gelöscht.`,
                                    }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="leer">Noch keine Noten. Lade ein PDF pro Instrument hoch.</p>
            )}
        </section>
    );
}
