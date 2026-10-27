import SongList from './SongList'
import AddSong from './AddSong'

export default function Songs() {
    return (
        <div className="Songs page-stack">
            <h1 className="page-title">Songs</h1>
            <AddSong />
            <SongList />
        </div>
    )
}
