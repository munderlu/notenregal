import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from './AppContext';
import SearchField from './SearchField';
import Regal from './Regal';
import { filterSongs } from './SongList';
import { zitatDesTages } from '../helper/zitate';

const MAX_TREFFER = 8;

export default function Start() {
    const { songs, sammlungen, error } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');

    const zitat = zitatDesTages();
    const treffer =searchTerm.trim() ? filterSongs(songs, searchTerm) : [];

    return (
        <div className="Start start">
            {error && <p className="alert" role="alert">{error}</p>}

            <section className="start__suche">
                <h1 className="sr-only">Notenregal</h1>
                <figure className={zitat.text.length > 60 ? 'zitat zitat--lang' : 'zitat'}>
                    <blockquote className="zitat__text">
                        <p>{zitat.text}</p>
                    </blockquote>
                    <figcaption className="zitat__quelle">
                        <span>
                            {zitat.von}
                            {zitat.werk && <span className="zitat__werk">, {zitat.werk}</span>}
                        </span>
                    </figcaption>
                </figure>
                <SearchField
                    className="search--gross"
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Titel oder Komponist"
                    label={`${songs.length} Songs durchsuchen`}
                />
                {searchTerm.trim() && (
                    <ul className="treffer">
                        {treffer.slice(0, MAX_TREFFER).map(song => (
                            <li key={song.song_id}>
                                <Link to={`/songs/${song.song_id}`} className="register__eintrag">
                                    <span className="register__titel">{song.title}</span>
                                    {song.composer && <span className="register__komponist">{song.composer}</span>}
                                </Link>
                            </li>
                        ))}
                        {treffer.length === 0 && (
                            <li className="leer">Kein Song passt zu „{searchTerm.trim()}“.</li>
                        )}
                        {treffer.length > MAX_TREFFER && (
                            <li className="treffer__mehr">
                                <Link to="/songs" className="textlink">Alle {treffer.length} Treffer in der Songliste ansehen</Link>
                            </li>
                        )}
                    </ul>
                )}
            </section>

            <section className="start__regal">
                <div className="section-head">
                    <h2 className="section-title">Sammlungen</h2>
                    <Link to="/sammlungen" className="textlink">Sammlungen verwalten</Link>
                </div>
                {sammlungen.length > 0 ? (
                    <Regal sammlungen={sammlungen} />
                ) : (
                    <p className="leer">Das Regal ist noch leer. Lege unter <Link to="/sammlungen" className="textlink">Sammlungen</Link> deine erste an.</p>
                )}
            </section>
        </div>
    );
}
