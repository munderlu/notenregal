import { useContext } from "react";
import { AppContext } from "./AppContext";
import { addSammlung } from "../helper/api";


export default function AddSammlung() {
    const { setSammlungen, setError } = useContext(AppContext);

    const handleAddSammlung = async (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.elements.name.value;

        try {
            const newSammlung = await addSammlung({ name });

            setSammlungen(prev => [...prev, newSammlung]);
            setError(null);
            form.reset();
        } catch (err) {
            setError('Error adding Sammlung');
        }
    }
    return (
        <div className="AddSammlung">
            <h1>Sammlung hinzufügen</h1>
            <form onSubmit={handleAddSammlung}>
                <input type="text" name="name" placeholder="Name der Sammlung" required />
                <button type="submit">Hinzufügen</button>
            </form>

        </div>
    );
};
