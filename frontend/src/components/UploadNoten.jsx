import { useState } from "react";
import { uploadPDF } from "../helper/api";

export default function UploadNoten() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // 1. Datei-Auswahl im State speichern
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            setUploadStatus('');
        } else {
            setUploadStatus('Bitte wähle eine gültige PDF-Datei aus.');
            setSelectedFile(null);
        }
    };

    // 2. PDF an das Node.js Backend senden
    const handleUpload = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setUploadStatus('Bitte wähle zuerst eine Datei aus.');
            return;
        }

        const formData = new FormData();
        // 'pdfFile' muss exakt mit upload.single('pdfFile') im Express-Backend übereinstimmen!
        formData.append('pdfFile', selectedFile);

        setIsUploading(true);
        setUploadStatus('Wird hochgeladen...');

        try {
            uploadPDF(formData);
        } catch (error) {
            console.error('Upload-Fehler im Frontend:', error);
            setUploadStatus('Verbindungsfehler zum Server.');
        } finally {
            setIsUploading(false);
            setUploadStatus('Hochgeladen.');
        }
    };

    return (
        <div>
            <h1>PDF Manager (WebDAV)</h1>

            {/* --- RECHTS: UPLOAD BEREICH --- */}
            <section>
                <h3>Neues PDF hochladen</h3>
                <form onSubmit={handleUpload}>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    <button
                        type="submit"
                        disabled={!selectedFile || isUploading}
                    >
                        {isUploading ? 'Lädt...' : 'Hochladen'}
                    </button>
                </form>
                {uploadStatus && <p>{uploadStatus}</p>}
            </section>
        </div>
    );
}
