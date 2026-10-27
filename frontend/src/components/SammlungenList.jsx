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
        <section className="SammlungenList">
            <h2 className="section-title">Alle Sammlungen</h2>
            {error && <p className="alert" role="alert">{error}</p>}
            <div className="search">
                <input
                    type="text"
                    placeholder="Suche nach Sammlungen"
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                    className="search__input"
                    value={searchTerm}
                />
                {searchTerm && (
                    <button className="search__clear" onClick={() => setSearchTerm("")} aria-label="Suche löschen">×</button>
                )}
            </div>
            <ul className="item-list">
                {filteredSammlungen.map((sammlung) => (
                    <li key={sammlung.sammlung_id} className="item">
                        <div className="item__info">
                            <span className="item__title">{sammlung.name}</span>
                        </div>
                        <div className="item__actions">
                            <UpdateDialogue fields={sammlungFields} initialValues={sammlung} onSave={(values) => handleUpdateSammlung(sammlung.sammlung_id, values)} />
                            <button className="btn btn--danger" onClick={() => handleDeleteSammlung(sammlung.sammlung_id)}>Löschen</button>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
};
