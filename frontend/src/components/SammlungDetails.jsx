import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getSammlungDetails } from "../helper/api";
import UpdateSammlungSong from "./UpdateSammlungSong";

export default function SammlungDetails() {
    const { sammlung_id } = useParams();
    const [sammlung, setSammlung] = useState({});
    const [error, setError] = useState(null);

    const loadSammlungData = async () => {
        try {
            const loadedSammlung = await getSammlungDetails(sammlung_id);

            setSammlung(loadedSammlung);
        } catch (err) {
            setError('Sammlung wurde nicht gefunden');
        }
    };

    useEffect(() => {
        loadSammlungData();
    }, [sammlung_id]);

    return (
        <article className="detail">
            <Link to="/sammlungen" className="back-link">← Alle Sammlungen</Link>
            {error && <p className="alert" role="alert">{error}</p>}
            {sammlung.name && (
                <>
                    <header className="detail__header">
                        <h1 className="page-title">{sammlung.name}</h1>
                    </header>

                </>
            )}
        </article>
    );
}
