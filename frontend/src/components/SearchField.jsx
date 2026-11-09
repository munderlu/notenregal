import { CloseIcon, SearchIcon } from './Icons';

// Suchfeld mit Lupe und Löschen-Knopf
export default function SearchField({ value, onChange, placeholder, label = 'Suchen', className = '', ...rest }) {
    return (
        <div className={`search ${className}`}>
            <SearchIcon size={18} />
            <input
                type="search"
                className="search__input"
                placeholder={placeholder}
                aria-label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                {...rest}
            />
            {value && (
                <button type="button" className="search__clear" onClick={() => onChange('')} aria-label="Suche leeren">
                    <CloseIcon size={16} />
                </button>
            )}
        </div>
    );
}
