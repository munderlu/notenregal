import { NavLink, useLocation } from 'react-router-dom';

export default function Header() {
    const { pathname } = useLocation();

    // Auf der Startseite gibt es keinen Header
    if (pathname === '/') return null;

    return (
        <header className="site-header">
            <div className="site-header__inner">
                <NavLink to="/" className="brand">
                    <span className="brand__icon" aria-hidden="true">𝄞</span>
                    Notenregal
                </NavLink>
                <nav className="main-nav">
                    <ul>
                        <li><NavLink to="/songs">Songs</NavLink></li>
                        <li><NavLink to="/sammlungen">Sammlungen</NavLink></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
