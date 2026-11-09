import { Link } from 'react-router-dom';
import { einbandFarbe, einbandHoehe, einbandBreite } from '../helper/einband';

// Sammlungen als Buchrücken auf einem Regalbrett.
// Titel laufen – wie bei deutschen Büchern üblich – von unten nach oben.
export default function Regal({ sammlungen }) {
    const sortiert = [...sammlungen].sort((a, b) => a.name.localeCompare(b.name, 'de'));

    return (
        <ul className="regal">
            {sortiert.map(sammlung => (
                <li key={sammlung.sammlung_id} className="regal__fach">
                    <Link
                        to={`/sammlungen/${sammlung.sammlung_id}`}
                        className="buchruecken"
                        style={{
                            '--einband': einbandFarbe(sammlung.sammlung_id),
                            '--hoehe': `${einbandHoehe(sammlung.sammlung_id)}%`,
                            '--breite': `${einbandBreite(sammlung.sammlung_id)}rem`,
                        }}
                        title={sammlung.name}
                    >
                        <span className="buchruecken__titel">{sammlung.name}</span>
                    </Link>
                </li>
            ))}
            {/* Füllt die letzte Reihe auf, damit das Brett bis zum Rand reicht */}
            <li className="regal__fach regal__fach--rest" aria-hidden="true" />
        </ul>
    );
}
