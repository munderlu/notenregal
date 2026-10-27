import { Link } from 'react-router-dom';

export default function Start() {
    return (
        <div className="Start start">
            <span className="start__icon" aria-hidden="true">𝄞</span>
            <h1 className="start__title">Notenregal</h1>
            <p className="start__subtitle">Viel Spaß beim Musizieren!</p>
            <nav className="start__links">
                <Link to="/songs" className="start-link">Songs</Link>
                <Link to="/sammlungen" className="start-link">Sammlungen</Link>
            </nav>
        </div>
    );
}
