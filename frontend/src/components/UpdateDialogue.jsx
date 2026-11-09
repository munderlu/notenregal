import { useState, useEffect, useRef, useId } from 'react';
import { PencilIcon } from './Icons';

/*
 * Dialog mit Formularfeldern – zum Anlegen und zum Bearbeiten.
 *
 * Props:
 *   fields         – [{ name, label, type, required, placeholder? }]
 *   initialValues  – Startwerte beim Öffnen
 *   onSave         – async (values) => void; wirft bei Fehler, dann bleibt der Dialog offen
 *   title          – Überschrift im Dialog
 *   submitLabel    – Beschriftung des Speichern-Buttons
 *   trigger        – 'label' (Icon + Text), 'icon' (nur Icon) oder 'primary' (Hauptaktion)
 *   triggerLabel   – Text auf dem Öffnen-Button
 *   triggerIcon    – Icon-Komponente auf dem Öffnen-Button
 *   label          – Beschriftung für Screenreader/Tooltip bei trigger="icon"
 *   onDelete       – optional; async () => void. Zeigt unten „Löschen“ mit Rückfrage
 *   deleteText     – { button, confirm } für den Löschen-Bereich
 */
export default function UpdateDialogue({
    fields,
    initialValues,
    onSave,
    title = 'Bearbeiten',
    submitLabel = 'Speichern',
    trigger = 'label',
    triggerLabel = 'Bearbeiten',
    triggerIcon: TriggerIcon = PencilIcon,
    label,
    onDelete,
    deleteText = { button: 'Löschen', confirm: 'Wirklich löschen?' },
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [values, setValues] = useState(initialValues);
    const [isBusy, setIsBusy] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [error, setError] = useState(null);

    const dialogRef = useRef(null);
    const id = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            setValues(initialValues);
            setConfirmDelete(false);
            setError(null);
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsBusy(true);
        setError(null);
        try {
            await onSave(values);
            setIsOpen(false);
        } catch (err) {
            console.error('Error saving values:', err);
            setError('Speichern hat nicht geklappt. Bitte noch einmal versuchen.');
        } finally {
            setIsBusy(false);
        }
    };

    const handleDelete = async () => {
        setIsBusy(true);
        setError(null);
        try {
            await onDelete();
            setIsOpen(false);
        } catch (err) {
            console.error('Error deleting:', err);
            setError('Löschen hat nicht geklappt. Bitte noch einmal versuchen.');
        } finally {
            setIsBusy(false);
        }
    };

    const triggerClass = {
        label: 'btn btn--secondary btn--with-icon',
        primary: 'btn btn--primary btn--with-icon',
        icon: 'btn btn--ghost btn--icon',
    }[trigger];

    return (
        <div className="UpdateDialogue">
            <button
                type="button"
                className={triggerClass}
                onClick={() => setIsOpen(true)}
                aria-label={trigger === 'icon' ? (label ?? triggerLabel) : undefined}
                title={trigger === 'icon' ? (label ?? triggerLabel) : undefined}
            >
                <TriggerIcon />
                {trigger !== 'icon' && <span>{triggerLabel}</span>}
            </button>
            <dialog ref={dialogRef} className="dialog" onClose={() => setIsOpen(false)}>
                <h2 className="dialog__title">{title}</h2>
                <form className="dialog__form" onSubmit={handleSubmit}>
                    {fields.map((field, index) => (
                        <div key={field.name} className="form-field">
                            <label htmlFor={`${id}-${field.name}`}>
                                {field.label}
                                {!field.required && <span className="form-field__optional"> (optional)</span>}
                            </label>
                            <input
                                type={field.type}
                                id={`${id}-${field.name}`}
                                required={field.required}
                                name={field.name}
                                placeholder={field.placeholder}
                                autoFocus={index === 0}
                                value={values[field.name] || ''}
                                onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                            />
                        </div>
                    ))}
                    {error && <p className="alert" role="alert">{error}</p>}
                    <div className="dialog__actions">
                        <button type="button" className="btn btn--secondary" onClick={() => setIsOpen(false)}>Abbrechen</button>
                        <button type="submit" className="btn btn--primary" disabled={isBusy}>{submitLabel}</button>
                    </div>
                </form>

                {onDelete && (
                    <div className="dialog__danger">
                        {confirmDelete ? (
                            <>
                                <p>{deleteText.confirm}</p>
                                <div className="dialog__danger-actions">
                                    <button type="button" className="btn btn--secondary" onClick={() => setConfirmDelete(false)}>Behalten</button>
                                    <button type="button" className="btn btn--danger-solid" onClick={handleDelete} disabled={isBusy}>
                                        Ja, löschen
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button type="button" className="btn btn--danger" onClick={() => setConfirmDelete(true)}>
                                {deleteText.button}
                            </button>
                        )}
                    </div>
                )}
            </dialog>
        </div>
    );
}
