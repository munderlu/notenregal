import { NavLink } from 'react-router-dom';

export default function Header() {
    return (
        <header className="site-header">
            <div className="site-header__inner">
                <NavLink to="/" className="brand">
                    <span className="brand__icon" aria-hidden="true">𝄞</span>
                    Notenregal
                </NavLink>
                <nav className="main-nav" aria-label="Hauptnavigation">
                    <ul>
                        <li><NavLink to="/songs">Songs</NavLink></li>
                        <li><NavLink to="/sammlungen">Sammlungen</NavLink></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
