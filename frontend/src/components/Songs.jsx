import SongList from './SongList'
import AddSong from './AddSong'

export default function Songs() {
    return (
        <div className="Songs">
            <AddSong />
            <SongList />
        </div>
    )
}
