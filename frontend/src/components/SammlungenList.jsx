import { useContext, useState } from 'react';
import { AppContext } from './AppContext';
import UpdateDialogue from './UpdateDialogue';

const deleteSammlung = async (sammlungId, setSongs, setError) => {
    try {
        const confirmed = window.confirm('Möchten Sie diese Sammlung wirklich löschen?');
        if (!confirmed) return;

        const response = await fetch(`/api/sammlungen/${sammlungId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        setSongs((prev) => prev.filter((sammlung) => sammlung.sammlung_id !== sammlungId));
    }
    catch (err) {
        console.error('Error deleting sammlung:', err);
        setError('Sammlung konnte nicht gelöscht werden.');
    }
}

const updateSammlung = async (sammlung_id, values, setSammlungen, setError) => {
    try {
        const response = await fetch(`/api/sammlungen/${sammlung_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const updatedSammlung = await response.json();

        setSammlungen((prev) => prev.map((sammlung) => (sammlung.sammlung_id === updatedSammlung.sammlung_id ? updatedSammlung : sammlung)).sort((a, b) => a.name.localeCompare(b.name)));

        setError(null);
    }
    catch (err) {
        console.error('Error updating song:', err);
        setError('Sammlung konnte nicht aktualisiert werden.');
    }
}

export default function SongList() {
    const { sammlungen, setSammlungen, error, setError } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSammlungen = sammlungen.filter((sammlung) => {
        const titleMatch = sammlung.name.toLowerCase().includes(searchTerm.toLowerCase());
        return titleMatch;
    });

    const sammlungFields = [
        { name: 'name', label: 'Name', type: 'text', required: true },
    ];

    return (
        <div className="SammlungenList">
            <h1>Sammlungen List</h1>
            {error && <p role="alert">{error}</p>}
            <input
                type="text"
                placeholder="Suche nach Sammlungen"
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                }}
                className="search-input"
            />
            <ul>
                {filteredSammlungen.map((sammlung) => (
                    <li key={sammlung.sammlung_id}>
                        {sammlung.name}
                        <br /><button onClick={() => deleteSammlung(sammlung.sammlung_id, setSammlungen, setError)}>Löschen</button>
                        <br /><UpdateDialogue fields={sammlungFields} initialValues={sammlung} onSave={(values) => updateSammlung(sammlung.sammlung_id, values, setSammlungen, setError)} />
                    </li>
                ))}
            </ul>
        </div>
    );
};
