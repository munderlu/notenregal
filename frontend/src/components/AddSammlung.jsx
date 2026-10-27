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
        <section className="AddSammlung card">
            <h2 className="card__title">Sammlung hinzufügen</h2>
            <form className="add-form" onSubmit={handleAddSammlung}>
                <input type="text" name="name" placeholder="Name der Sammlung" required />
                <button type="submit" className="btn btn--primary">Hinzufügen</button>
            </form>

        </section>
    );
};
