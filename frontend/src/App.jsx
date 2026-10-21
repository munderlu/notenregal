import './App.css'
import SongList from './components/SongList'
import AddSong from './components/AddSong'
import { AppProvider } from './components/AppContext'

function App() {
    return (
        <AppProvider>
            <div className="App">
                <SongList />
                <AddSong />
            </div>
        </AppProvider>
    )
}

export default App
