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
            <button onClick={() => setIsOpen(true)}>Bearbeiten</button>
            <dialog ref={dialogRef} onClose={() => setIsOpen(false)}>
                <h2>Bearbeiten</h2>
                <form onSubmit={handleSubmit}>
                    {fields.map((field) => (
                        <div key={field.name}>
                            <label htmlFor={id}>{field.label}</label>
                            <input
                                type={field.type}
                                id={id}
                                required={field.required}
                                name={field.name}
                                value={values[field.name] || ''}
                                onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                            />
                        </div>
                    ))}
                    <button type="submit">Aktualisieren</button>
                    <button type="button" onClick={() => setIsOpen(false)}>Abbrechen</button>
                </form>
            </dialog>
        </div>
    )
}
