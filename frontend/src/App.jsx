import './App.css'
import Header from './components/Header'
import Start from './components/Start'
import Songs from './components/Songs'
import Sammlungen from './components/Sammlungen'
import SongDetails from './components/SongDetails'
import SammlungDetails from './components/SammlungDetails'
import { AppProvider } from './components/AppContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Der PDF-Viewer bringt pdf.js mit und wird deshalb erst beim Öffnen geladen
const NotenViewer = lazy(() => import('./components/NotenViewer'))

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
                        <Route path="/songs/:song_id/noten/:noten_id" element={<Suspense fallback={null}><NotenViewer /></Suspense>} />
                        <Route path="/sammlungen/:sammlung_id" element={<SammlungDetails />} />
                    </Routes>
                </main>
            </BrowserRouter>
        </AppProvider>
    )
}

export default App
