import { useState, useEffect, useRef, useId } from 'react';

/*
 * Allgemeiner Dialog, um Verknüpfungen per Checkbox zu bearbeiten
 * (z. B. Sammlungen eines Songs oder Songs einer Sammlung).
 *
 * Props:
 *   items       – alle auswählbaren Einträge als [{ id, label, meta? }]
 *   initialIds  – IDs, die aktuell verknüpft sind
 *   onCreate    – async (name) => neue ID; legt einen neuen Eintrag an
 *   onSave      – async (toAdd, toDelete) => void; speichert die Änderungen
 *   texts       – Beschriftungen: { button, title, placeholder, create(name), notFound, empty }
 */
export default function UpdateZuordnung({ items, initialIds, onCreate, onSave, texts }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const dialogRef = useRef(null);
    const formId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            setSelectedIds(initialIds);
            setSearchTerm('');
            setError(null);
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [isOpen]);

    const handleToggle = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(selectedId => selectedId !== id)
                : [...prev, id]
        );
    };

    const trimmedSearch = searchTerm.trim();
    const search = trimmedSearch.toLowerCase();

    const filteredItems = items
        .filter(item =>
            item.label.toLowerCase().includes(search) ||
            item.meta?.toLowerCase().includes(search)
        )
        .sort((a, b) => a.label.localeCompare(b.label, 'de'));

    // Anlegen nur anbieten, wenn es noch keinen Eintrag mit genau diesem Namen gibt
    const exactMatch = items.some(item => item.label.toLowerCase() === search);
    const canCreate = trimmedSearch !== '' && !exactMatch;

    const handleCreate = async () => {
        if (!canCreate || isCreating) return;

        setIsCreating(true);
        setError(null);

        try {
            const newId = await onCreate(trimmedSearch);

            setSelectedIds(prev => [...prev, newId]);
            setSearchTerm('');
        } catch (err) {
            setError('Neuer Eintrag konnte nicht erstellt werden.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const toAdd = selectedIds.filter(id => !initialIds.includes(id));
        const toDelete = initialIds.filter(id => !selectedIds.includes(id));

        try {
            await onSave(toAdd, toDelete);
            setIsOpen(false);
        } catch (err) {
            console.error('Error saving zuordnung:', err);
            setError('Änderungen konnten nicht gespeichert werden.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="UpdateDialogue">
            <button type="button" className="btn btn--secondary" onClick={() => setIsOpen(true)}>{texts.button}</button>
            <dialog ref={dialogRef} className="dialog" onClose={() => setIsOpen(false)}>
                <h2 className="dialog__title">{texts.title}</h2>
                {error && <p className="alert" role="alert">{error}</p>}

                <div className="search">
                    <input
                        type="text"
                        className="search__input"
                        placeholder={texts.placeholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreate();
                            }
                        }}
                    />
                    {searchTerm && (
                        <button type="button" className="search__clear" onClick={() => setSearchTerm('')} aria-label="Suche löschen">×</button>
                    )}
                </div>

                <form id={formId} className="dialog__form" onSubmit={handleSubmit}>
                    <ul className="checkbox-list">
                        {filteredItems.map(item => (
                            <li key={item.id} className="checkbox-item">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => handleToggle(item.id)}
                                    />
                                    <span>
                                        {item.label}
                                        {item.meta && <small className="checkbox-item__meta">{item.meta}</small>}
                                    </span>
                                </label>
                            </li>
                        ))}
                        {canCreate && (
                            <li className="checkbox-item">
                                <button
                                    type="button"
                                    className="checkbox-item__create"
                                    onClick={handleCreate}
                                    disabled={isCreating}
                                >
                                    + {texts.create(trimmedSearch)}
                                </button>
                            </li>
                        )}
                        {filteredItems.length === 0 && !canCreate && (
                            <li className="checkbox-item checkbox-item--empty">
                                {searchTerm ? texts.notFound : texts.empty}
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
