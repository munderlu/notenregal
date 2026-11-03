import { useState, useEffect, useRef, useId } from 'react';
import { PencilIcon } from './Icons';

// showLabel: Text „Bearbeiten“ neben dem Stift anzeigen (z. B. im Kopf der Detailseite)
// label: Beschriftung für Screenreader/Tooltip, wenn nur das Icon sichtbar ist
export default function UpdateDialogue({ fields, initialValues, onSave, showLabel = false, label = 'Bearbeiten' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [values, setValues] = useState(initialValues);

    const dialogRef = useRef(null);
    const id = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            setValues(initialValues);
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSave(values);
            setIsOpen(false);
        } catch (error) {
            console.error('Error updating values:', error);
        }
    }


    return (
        <div className="UpdateDialogue">
            <button
                type="button"
                className={showLabel ? 'btn btn--secondary btn--with-icon' : 'btn btn--secondary btn--icon'}
                onClick={() => setIsOpen(true)}
                aria-label={showLabel ? undefined : label}
                title={showLabel ? undefined : label}
            >
                <PencilIcon />
                {showLabel && <span>Bearbeiten</span>}
            </button>
            <dialog ref={dialogRef} className="dialog" onClose={() => setIsOpen(false)}>
                <h2 className="dialog__title">Bearbeiten</h2>
                <form className="dialog__form" onSubmit={handleSubmit}>
                    {fields.map((field) => (
                        <div key={field.name} className="form-field">
                            <label htmlFor={`${id}-${field.name}`}>{field.label}</label>
                            <input
                                type={field.type}
                                id={`${id}-${field.name}`}
                                required={field.required}
                                name={field.name}
                                value={values[field.name] || ''}
                                onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                            />
                        </div>
                    ))}
                    <div className="dialog__actions">
                        <button type="button" className="btn btn--secondary" onClick={() => setIsOpen(false)}>Abbrechen</button>
                        <button type="submit" className="btn btn--primary">Aktualisieren</button>
                    </div>
                </form>
            </dialog>
        </div>
    )
}
