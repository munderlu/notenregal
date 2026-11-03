import { useState, useEffect, useRef, useContext, useId } from 'react';
import { AppContext } from './AppContext';
import { addSong, addSongToSammlung, deleteSongFromSammlung } from '../helper/api';

// Gegenstück zu UpdateSammlungSong: legt fest, welche Songs in einer Sammlung sind
export default function UpdateSongSammlung({ sammlung, onSaved }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const { songs, setSongs } = useContext(AppContext);

    const dialogRef = useRef(null);
    const formId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            const currentIds = (sammlung.songs || []).map(s => s.song_id);
            setSelectedIds(currentIds);
            setSearchTerm('');
            setError(null);
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [isOpen]);

    const handleToggle = (song_id) => {
        setSelectedIds(prev =>
            prev.includes(song_id)
                ? prev.filter(id => id !== song_id)
                : [...prev, song_id]
        );
    };

    const trimmedSearch = searchTerm.trim();
    const search = trimmedSearch.toLowerCase();

    const filteredSongs = songs
        .filter(song =>
            song.title.toLowerCase().includes(search) ||
            song.composer?.toLowerCase().includes(search)
        )
        .sort((a, b) => a.title.localeCompare(b.title, 'de'));

    // Anlegen nur anbieten, wenn es noch keinen Song mit genau diesem Titel gibt
    const exactMatch = songs.some(song => song.title.toLowerCase() === search);
    const canCreate = trimmedSearch !== '' && !exactMatch;

    const handleCreateSong = async () => {
        if (!canCreate || isCreating) return;

        setIsCreating(true);
        setError(null);

        try {
            const neuerSong = await addSong({ title: trimmedSearch });

            setSongs(prev => [...prev, neuerSong]);
            setSelectedIds(prev => [...prev, neuerSong.song_id]);
            setSearchTerm('');
        } catch (err) {
            setError('Neuer Song konnte nicht erstellt werden.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const initialIds = (sammlung.songs || []).map(s => s.song_id);
        const toAdd = selectedIds.filter(id => !initialIds.includes(id));
        const toDelete = initialIds.filter(id => !selectedIds.includes(id));

        try {
            await Promise.all([
                ...toAdd.map(id => addSongToSammlung(id, sammlung.sammlung_id)),
                ...toDelete.map(id => deleteSongFromSammlung(id, sammlung.sammlung_id))
            ]);

            await onSaved();
            setIsOpen(false);
        } catch (err) {
            console.error('Error updating songs of sammlung:', err);
            setError('Songs konnten nicht gespeichert werden.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="UpdateDialogue">
            <button type="button" className="btn btn--secondary" onClick={() => setIsOpen(true)}>Songs ändern</button>
            <dialog ref={dialogRef} className="dialog" onClose={() => setIsOpen(false)}>
                <h2 className="dialog__title">Songs bearbeiten</h2>
                {error && <p className="alert" role="alert">{error}</p>}

                <div className="search">
                    <input
                        type="text"
                        className="search__input"
                        placeholder="Song suchen oder neu anlegen"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateSong();
                            }
                        }}
                    />
                    {searchTerm && (
                        <button type="button" className="search__clear" onClick={() => setSearchTerm('')} aria-label="Suche löschen">×</button>
                    )}
                </div>

                <form id={formId} className="dialog__form" onSubmit={handleSubmit}>
                    <ul className="checkbox-list">
                        {filteredSongs.map(song => (
                            <li key={song.song_id} className="checkbox-item">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(song.song_id)}
                                        onChange={() => handleToggle(song.song_id)}
                                    />
                                    <span>
                                        {song.title}
                                        {song.composer && <small className="checkbox-item__meta">{song.composer}</small>}
                                    </span>
                                </label>
                            </li>
                        ))}
                        {canCreate && (
                            <li className="checkbox-item">
                                <button
                                    type="button"
                                    className="checkbox-item__create"
                                    onClick={handleCreateSong}
                                    disabled={isCreating}
                                >
                                    + „{trimmedSearch}“ als neuen Song anlegen
                                </button>
                            </li>
                        )}
                        {filteredSongs.length === 0 && !canCreate && (
                            <li className="checkbox-item checkbox-item--empty">
                                {searchTerm ? 'Kein Song gefunden.' : 'Noch keine Songs vorhanden.'}
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
