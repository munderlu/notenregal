import { useContext } from "react";
import { AppContext } from "./AppContext";
import { addSong } from "../helper/api";


export default function AddSong() {
    const { setSongs, setError } = useContext(AppContext);

    const handleAddSong = async (e) => {
        e.preventDefault();
        const form = e.target;
        const [title, composer] = [form.elements.title.value, form.elements.composer.value];

        try {
            const addedSong = await addSong({ title, composer });

            setSongs(prev => [...prev, addedSong]);
            setError(null);
            form.reset();
        } catch (err) {
            setError('Error adding song.');
        }
    }
    return (
        <div className="AddSong">
            <h1>Song hinzufügen</h1>
            <form onSubmit={handleAddSong}>
                <input type="text" name="title" placeholder="Song Titel" required />
                <input type="text" name="composer" placeholder="Komponist (optional)" />
                <button type="submit">Hinzufügen</button>
            </form>

        </div>
    );
};
