import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./AppContext";
import AddSammlung from "./AddSammlung";
import Regal from "./Regal";
import SearchField from "./SearchField";

export default function Sammlungen() {
    const { sammlungen, error } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const search = searchTerm.trim().toLowerCase();
    const gefiltert = sammlungen.filter(s => s.name.toLowerCase().includes(search));

    return (
        <div className="Sammlungen page-stack">
            <div className="page-head">
                <h1 className="page-title">Sammlungen</h1>
                <p className="page-count">{sammlungen.length === 1 ? '1 Sammlung' : `${sammlungen.length} Sammlungen`}</p>
            </div>

            <div className="toolbar">
                <SearchField
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Sammlung suchen"
                    label="Sammlungen durchsuchen"
                />
                <AddSammlung
                    initialName={searchTerm.trim()}
                    onCreated={(neu) => navigate(`/sammlungen/${neu.sammlung_id}`)}
                />
            </div>

            {error && <p className="alert" role="alert">{error}</p>}

            {gefiltert.length > 0 ? (
                <Regal sammlungen={gefiltert} />
            ) : (
                <p className="leer">
                    {search ? `Keine Sammlung heißt „${searchTerm.trim()}“.` : 'Noch keine Sammlungen. Lege mit „Neue Sammlung“ die erste an.'}
                </p>
            )}
        </div>
    );
}
