import { useState, useEffect, useRef, useContext, useId } from 'react';
import { AppContext } from './AppContext';
import { addSammlung, addSongToSammlung, deleteSongFromSammlung } from '../helper/api';

export default function UpdateSammlungSong({ song, onSaved }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const { sammlungen, setSammlungen } = useContext(AppContext);

    const dialogRef = useRef(null);
    const formId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            const currentIds = (song.sammlungen || []).map(s => s.sammlung_id);
            setSelectedIds(currentIds);
            setSearchTerm('');
            setError(null);
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [isOpen]);

    const handleToggle = (sammlung_id) => {
        setSelectedIds(prev =>
            prev.includes(sammlung_id)
                ? prev.filter(id => id !== sammlung_id)
                : [...prev, sammlung_id]
        );
    };

    const trimmedSearch = searchTerm.trim();

    const filteredSammlungen = sammlungen.filter(sammlung =>
        sammlung.name.toLowerCase().includes(trimmedSearch.toLowerCase())
    );

    // Anlegen nur anbieten, wenn es noch keine Sammlung mit genau diesem Namen gibt
    const exactMatch = sammlungen.some(
        sammlung => sammlung.name.toLowerCase() === trimmedSearch.toLowerCase()
    );
    const canCreate = trimmedSearch !== '' && !exactMatch;

    const handleCreateSammlung = async () => {
        if (!canCreate || isCreating) return;

        setIsCreating(true);
        setError(null);

        try {
            const neueSammlung = await addSammlung({ name: trimmedSearch });

            setSammlungen(prev => [...prev, neueSammlung].sort((a, b) => a.name.localeCompare(b.name)));
            setSelectedIds(prev => [...prev, neueSammlung.sammlung_id]);
            setSearchTerm('');
        } catch (err) {
            setError('Neue Sammlung konnte nicht erstellt werden.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const initialIds = (song.sammlungen || []).map(s => s.sammlung_id);

        const toAdd = selectedIds.filter(id => !initialIds.includes(id));

        const toDelete = initialIds.filter(id => !selectedIds.includes(id));

        try {
            await Promise.all([
                ...toAdd.map(id => addSongToSammlung(song.song_id, id)),
                ...toDelete.map(id => deleteSongFromSammlung(song.song_id, id))
            ]);

            await onSaved();
            setIsOpen(false);
        } catch (err) {
            console.error('Error updating values:', err);
            setError('Einstellungen konnten nicht gespeichert werden.');
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="UpdateDialogue">
            <button type="button" className="btn btn--secondary" onClick={() => setIsOpen(true)}>Sammlungen ändern</button>
            <dialog ref={dialogRef} className="dialog" onClose={() => setIsOpen(false)}>
                <h2 className="dialog__title">Sammlungen bearbeiten</h2>
                {error && <p className="alert" role="alert">{error}</p>}

                <div className="search">
                    <input
                        type="text"
                        className="search__input"
                        placeholder="Sammlung suchen oder neu anlegen"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateSammlung();
                            }
                        }}
                    />
                    {searchTerm && (
                        <button type="button" className="search__clear" onClick={() => setSearchTerm('')} aria-label="Suche löschen">×</button>
                    )}
                </div>

                <form id={formId} className="dialog__form" onSubmit={handleSubmit}>
                    <ul className="checkbox-list">
                        {filteredSammlungen.map(sammlung => (
                            <li key={sammlung.sammlung_id} className="checkbox-item">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(sammlung.sammlung_id)}
                                        onChange={() => handleToggle(sammlung.sammlung_id)}
                                    />
                                    <span>{sammlung.name}</span>
                                </label>
                            </li>
                        ))}
                        {canCreate && (
                            <li className="checkbox-item">
                                <button
                                    type="button"
                                    className="checkbox-item__create"
                                    onClick={handleCreateSammlung}
                                    disabled={isCreating}
                                >
                                    + „{trimmedSearch}“ als neue Sammlung anlegen
                                </button>
                            </li>
                        )}
                        {filteredSammlungen.length === 0 && !canCreate && (
                            <li className="checkbox-item checkbox-item--empty">
                                {searchTerm ? 'Keine Sammlung gefunden.' : 'Noch keine Sammlungen vorhanden.'}
                            </li>
                        )}
                    </ul>
                </form>

                <div className="dialog__actions">
                    <button type="button" className="btn btn--secondary" onClick={() => setIsOpen(false)}>Abbrechen</button>
                    <button type="submit" form={formId} className="btn btn--primary" disabled={isSaving}>
                        {isSaving ? 'Speichern…' : 'Speichern'}
                    </button>
                </div>
            </dialog>
        </div>
    );
}
