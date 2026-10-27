import { useContext, useState } from 'react';
import { AppContext } from './AppContext';
import UpdateDialogue from './UpdateDialogue';
import { updateSammlung, deleteSammlung } from '../helper/api';

const sammlungFields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
];

export default function SammlungenList() {
    const { sammlungen, setSammlungen, error, setError } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSammlungen = sammlungen.filter((sammlung) => {
        const titleMatch = sammlung.name.toLowerCase().includes(searchTerm.toLowerCase());
        return titleMatch;
    }).sort(
        (a, b) => a.name.localeCompare(b.name, 'de')
    );

    const handleUpdateSammlung = async (sammlung_id, values) => {
        try {
            const updatedSammlung = await updateSammlung(sammlung_id, values);

            setSammlungen(prev => prev.map(
                sammlung => sammlung.sammlung_id === sammlung_id ? updatedSammlung : sammlung
            ));

            setError(null);
        } catch (err) {
            setError('Error updating Sammlung');
        }
    }

    const handleDeleteSammlung = async (sammlung_id) => {
        try {
            const answer = await deleteSammlung(sammlung_id);

            if (answer) {
                setSammlungen(prev => prev.filter(
                    sammlung => sammlung.sammlung_id !== sammlung_id
                ));
            }
        } catch (err) {
            setError('Error deleting Sammlung')
        }
    }


    return (
        <div className="SammlungenList">
            <h1>Sammlungen List</h1>
            {error && <p role="alert">{error}</p>}
            <div className='suche'>
                <input
                    type="text"
                    placeholder="Suche nach Sammlungen"
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                    className="search-input"
                    value={searchTerm}
                />
                <button onClick={() => setSearchTerm("")}>Löschen</button>
            </div>
            <ul>
                {filteredSammlungen.map((sammlung) => (
                    <li key={sammlung.sammlung_id}>
                        {sammlung.name}
                        <br /><button onClick={() => handleDeleteSammlung(sammlung.sammlung_id)}>Löschen</button>
                        <br /><UpdateDialogue fields={sammlungFields} initialValues={sammlung} onSave={(values) => handleUpdateSammlung(sammlung.sammlung_id, values)} />
                    </li>
                ))}
            </ul>
        </div>
    );
};
