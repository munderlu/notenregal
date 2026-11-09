import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './AppContext';
import SongList, { filterSongs } from './SongList';
import AddSong from './AddSong';
import SearchField from './SearchField';

export default function Songs() {
    const { songs, error } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const gefiltert = filterSongs(songs, searchTerm);

    return (
        <div className="Songs page-stack">
            <div className="page-head">
                <h1 className="page-title">Songs</h1>
                <p className="page-count">{songs.length === 1 ? '1 Song' : `${songs.length} Songs`}</p>
            </div>

            <div className="toolbar">
                <SearchField
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Titel oder Komponist suchen"
                    label="Songs durchsuchen"
                />
                <AddSong
                    initialTitle={searchTerm.trim()}
                    onCreated={(neu) => navigate(`/songs/${neu.song_id}`)}
                />
            </div>

            {error && <p className="alert" role="alert">{error}</p>}

            {gefiltert.length > 0 ? (
                <SongList songs={gefiltert} />
            ) : (
                <p className="leer">
                    {searchTerm.trim()
                        ? `Kein Song passt zu „${searchTerm.trim()}“. Mit „Neuer Song“ legst du ihn an.`
                        : 'Noch keine Songs. Lege mit „Neuer Song“ den ersten an.'}
                </p>
            )}
        </div>
    );
}
