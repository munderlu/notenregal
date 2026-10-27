import './App.css'
import Header from './components/Header'
import Start from './components/Start'
import Songs from './components/Songs'
import Sammlungen from './components/Sammlungen'
import SongDetails from './components/SongDetails'
import { AppProvider } from './components/AppContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Header />
                <main className="page">
                    <Routes>
                        <Route path="/" element={<Start />} />
                        <Route path="/songs" element={<Songs />} />
                        <Route path="/sammlungen" element={<Sammlungen />} />
                        <Route path="/songs/:song_id" element={<SongDetails />} />
                    </Routes>
                </main>
            </BrowserRouter>
        </AppProvider>
    )
}

export default App
