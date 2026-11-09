import { Link } from 'react-router-dom';

export const songFields = [
    { name: 'title', label: 'Titel', type: 'text', required: true },
    { name: 'composer', label: 'Komponist', type: 'text', required: false },
];

// Songs nach Titel oder Komponist filtern und alphabetisch sortieren
export function filterSongs(songs, searchTerm) {
    const search = searchTerm.trim().toLowerCase();

    return songs
        .filter(song =>
            song.title.toLowerCase().includes(search) ||
            song.composer?.toLowerCase().includes(search)
        )
        .sort((a, b) => a.title.localeCompare(b.title, 'de'));
}

// Anfangsbuchstabe für das Register: Umlaute zum Grundbuchstaben, Ziffern/Zeichen zu „#“
function registerBuchstabe(title) {
    const erster = title.trim().charAt(0).normalize('NFD').charAt(0).toUpperCase();
    return /[A-Z]/.test(erster) ? erster : '#';
}

// Alphabetisches Register: Songs nach Anfangsbuchstaben gruppiert.
// Erwartet bereits sortierte Songs.
export default function SongList({ songs }) {
    const gruppen = [];
    for (const song of songs) {
        const buchstabe = registerBuchstabe(song.title);
        const letzte = gruppen.at(-1);
        if (letzte?.buchstabe === buchstabe) {
            letzte.songs.push(song);
        } else {
            gruppen.push({ buchstabe, songs: [song] });
        }
    }

    return (
        <div className="register">
            {gruppen.map(gruppe => (
                <section key={gruppe.buchstabe} className="register__gruppe" aria-label={`Songs mit ${gruppe.buchstabe}`}>
                    <h2 className="register__buchstabe" aria-hidden="true">{gruppe.buchstabe}</h2>
                    <ul className="register__liste">
                        {gruppe.songs.map(song => (
                            <li key={song.song_id}>
                                <Link to={`/songs/${song.song_id}`} className="register__eintrag">
                                    <span className="register__titel">{song.title}</span>
                                    {song.composer && <span className="register__komponist">{song.composer}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}
