import './App.css'
import Header from './components/Header'
import Songs from './components/Songs'
import Sammlungen from './components/Sammlungen'
import { AppProvider } from './components/AppContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route path="/" element={<Songs />} />
                    <Route path="/sammlungen" element={<Sammlungen />} />
                </Routes>
            </BrowserRouter>
        </AppProvider>
    )
}

export default App
