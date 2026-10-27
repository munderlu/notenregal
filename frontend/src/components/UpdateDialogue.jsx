import { useState, useEffect, useRef, useId } from 'react';

export default function UpdateDialogue({ fields, initialValues, onSave }) {
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
            <button className="btn btn--secondary" onClick={() => setIsOpen(true)}>Bearbeiten</button>
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
