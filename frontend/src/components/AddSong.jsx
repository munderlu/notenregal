import { addSong } from "../helper/songsHelper";
import { useContext } from "react";
import { AppContext } from "./AppContext";


export default function AddSong() {
    const { setSongs, setError } = useContext(AppContext);
    return (
        <div className="AddSong">
            <h1>Song hinzufügen</h1>
            <form onSubmit={(e) => addSong(e, setSongs, setError)}>
                <input type="text" name="title" placeholder="Song Titel" required />
                <input type="text" name="composer" placeholder="Komponist (optional)" />
                <button type="submit">Hinzufügen</button>
            </form>

        </div>
    );
};
