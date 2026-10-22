import { useContext } from "react";
import { AppContext } from "./AppContext";

function addSammlung(e, setSammlungen, setError) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");

    fetch("/api/sammlungen", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Fehler beim Hinzufügen der Sammlung");
            }
            return response.json();
        }
        )
        .then((newSammlung) => {
            setSammlungen((prevSammlungen) => [...prevSammlungen, newSammlung]);
            e.target.reset();
        })
        .catch((error) => {
            console.error(error);
            setError(error.message);
        });
}


export default function AddSammlung() {
    const { setSammlungen, setError } = useContext(AppContext);
    return (
        <div className="AddSammlung">
            <h1>Sammlung hinzufügen</h1>
            <form onSubmit={(e) => addSammlung(e, setSammlungen, setError)}>
                <input type="text" name="name" placeholder="Name der Sammlung" required />
                <button type="submit">Hinzufügen</button>
            </form>

        </div>
    );
};
