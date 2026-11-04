import { useState, useEffect, useRef, useId } from "react";
import { uploadNoten } from "../helper/api";
import { UploadIcon } from "./Icons";

// Dialog zum Hochladen einer PDF (Noten für ein Instrument) zu einem Song.
// onUploaded wird mit den neu angelegten Noten aufgerufen.
export default function UploadNoten({ song_id, onUploaded }) {
    const [isOpen, setIsOpen] = useState(false);
    const [instrument, setInstrument] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [status, setStatus] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const dialogRef = useRef(null);
    const fileInputRef = useRef(null);
    const id = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            setInstrument('');
            setSelectedFile(null);
            setStatus('');
            // Auch das native Feld leeren, sonst löst dieselbe Datei kein onChange mehr aus
            if (fileInputRef.current) fileInputRef.current.value = '';
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [isOpen]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            setStatus('');
        } else {
            setSelectedFile(null);
            setStatus('Bitte wähle eine gültige PDF-Datei aus.');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setStatus('Bitte wähle zuerst eine Datei aus.');
            return;
        }

        const formData = new FormData();
        formData.append('instrument', instrument.trim());
        // 'pdfFile' muss exakt mit upload.single('pdfFile') im Backend übereinstimmen!
        formData.append('pdfFile', selectedFile);

        setIsUploading(true);
        setStatus('Wird hochgeladen...');
        try {
            const neueNoten = await uploadNoten(song_id, formData);
            onUploaded?.(neueNoten);
            setIsOpen(false);
        } catch (err) {
            setStatus('Upload fehlgeschlagen. Bitte erneut versuchen.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="UpdateDialogue">
            <button
                type="button"
                className="btn btn--secondary btn--with-icon"
                onClick={() => setIsOpen(true)}
            >
                <UploadIcon />
                <span>Noten hochladen</span>
            </button>
            <dialog ref={dialogRef} className="dialog" onClose={() => setIsOpen(false)}>
                <h2 className="dialog__title">Noten hochladen</h2>
                <form className="dialog__form" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor={`${id}-instrument`}>Instrument</label>
                        <input
                            type="text"
                            id={`${id}-instrument`}
                            required
                            value={instrument}
                            onChange={(e) => setInstrument(e.target.value)}
                            disabled={isUploading}
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor={`${id}-file`}>PDF-Datei</label>
                        {/* Natives Feld bleibt für Tastatur/Screenreader erhalten, ist aber unsichtbar.
                            Angezeigt wird die eigene Box, in der lange Namen gekürzt werden. */}
                        <div className="file-input">
                            <input
                                ref={fileInputRef}
                                type="file"
                                id={`${id}-file`}
                                className="file-input__native"
                                accept="application/pdf"
                                required
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                            <label htmlFor={`${id}-file`} className="file-input__box" aria-hidden="true">
                                <span className="btn btn--secondary file-input__button">Datei auswählen</span>
                                <span className="file-input__name" title={selectedFile?.name}>
                                    {selectedFile?.name ?? 'Keine Datei ausgewählt'}
                                </span>
                            </label>
                        </div>
                    </div>
                    {status && <p className="dialog__status">{status}</p>}
                    <div className="dialog__actions">
                        <button type="button" className="btn btn--secondary" onClick={() => setIsOpen(false)} disabled={isUploading}>Abbrechen</button>
                        <button type="submit" className="btn btn--primary" disabled={!selectedFile || isUploading}>
                            {isUploading ? 'Lädt...' : 'Hochladen'}
                        </button>
                    </div>
                </form>
            </dialog>
        </div>
    );
}
