import { Link } from 'react-router-dom';

export default function Header() {
    return (
        <header>
            <nav>
                <ul>
                    <li><Link to="/">Songs</Link></li>
                    <li><Link to="/sammlungen">Sammlungen</Link></li>
                </ul>
            </nav>
        </header>
    );
}
