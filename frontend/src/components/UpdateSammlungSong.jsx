import { useState, useEffect, useRef, useContext, useId } from 'react';
import { AppContext } from './AppContext';
import { addSammlung, addSongToSammlung, deleteSongFromSammlung } from '../helper/api';

export default function UpdateSammlungSong({ song, onSaved }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newSammlungName, setNewSammlungName] = useState('');
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
            setNewSammlungName('');
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

    const filteredSammlungen = sammlungen.filter(sammlung =>
        sammlung.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateSammlung = async (e) => {
        e.preventDefault();
        const trimed = newSammlungName.trim();
        if (!trimed) return;

        try {
            const neueSammlung = await addSammlung({ name: trimed });

            setSammlungen(prev => [...prev, neueSammlung].sort((a, b) => a.name.localeCompare(b.name)
            ));

            setSelectedIds(prev => [...prev, neueSammlung.sammlung_id]);

            setNewSammlungName('');
        } catch (err) {
            setError('Neue Sammlung konnte nicht erstellt werden.')
        }
    }

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
                        placeholder="Suche nach Sammlung"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                        {filteredSammlungen.length === 0 && (
                            <li className="checkbox-item checkbox-item--empty">
                                {searchTerm ? 'Keine Sammlung gefunden.' : 'Noch keine Sammlungen vorhanden.'}
                            </li>
                        )}
                    </ul>
                </form>

                <form className="add-form" onSubmit={handleCreateSammlung}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Neue Sammlung anlegen"
                        required
                        value={newSammlungName}
                        onChange={(e) => setNewSammlungName(e.target.value)}
                    />
                    <button type="submit" className="btn btn--secondary">Anlegen</button>
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
