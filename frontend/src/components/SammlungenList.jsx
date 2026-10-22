import { useContext, useState } from 'react';
import { AppContext } from './AppContext';
import UpdateSammlung from './UpdateSammlung';

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

export default function SongList() {
    const { sammlungen, setSammlungen, error, setError } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSammlungen = sammlungen.filter((sammlung) => {
        const titleMatch = sammlung.name.toLowerCase().includes(searchTerm.toLowerCase());
        return titleMatch;
    });

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
                        <br /><UpdateSammlung sammlung={sammlung} />
                    </li>
                ))}
            </ul>
        </div>
    );
};
