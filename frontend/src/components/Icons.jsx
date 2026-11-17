// Kleine Inline-SVG-Icons (ohne zusätzliche Bibliothek).
// Sie übernehmen die Textfarbe (currentColor) und sind für Screenreader
// versteckt – der Button selbst braucht deshalb ein aria-label.

function Icon({ children, size = 18 }) {
    return (
        <svg
            className="icon"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {children}
        </svg>
    );
}

export function PencilIcon(props) {
    return (
        <Icon {...props}>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </Icon>
    );
}

export function TrashIcon(props) {
    return (
        <Icon {...props}>
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
        </Icon>
    );
}

export function DownloadIcon(props) {
    return (
        <Icon {...props}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M7 10l5 5 5-5" />
            <path d="M12 15V3" />
        </Icon>
    );
}

export function UploadIcon(props) {
    return (
        <Icon {...props}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M17 8l-5-5-5 5" />
            <path d="M12 3v12" />
        </Icon>
    );
}

export function PlusIcon(props) {
    return (
        <Icon {...props}>
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </Icon>
    );
}

export function CloseIcon(props) {
    return (
        <Icon {...props}>
            <path d="M18 6 6 18" />
            <path d="M6 6l12 12" />
        </Icon>
    );
}

export function ChevronLeftIcon(props) {
    return (
        <Icon {...props}>
            <path d="M15 18l-6-6 6-6" />
        </Icon>
    );
}

export function SearchIcon(props) {
    return (
        <Icon {...props}>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
        </Icon>
    );
}

export function ChevronRightIcon(props) {
    return (
        <Icon {...props}>
            <path d="M9 18l6-6-6-6" />
        </Icon>
    );
}

export function ZoomInIcon(props) {
    return (
        <Icon {...props}>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
            <path d="M11 8v6" />
            <path d="M8 11h6" />
        </Icon>
    );
}

export function ZoomOutIcon(props) {
    return (
        <Icon {...props}>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
            <path d="M8 11h6" />
        </Icon>
    );
}

// Ganze Seite einpassen: Blatt in einem Rahmen aus Ecken
export function FitPageIcon(props) {
    return (
        <Icon {...props}>
            <path d="M4 8V5a1 1 0 0 1 1-1h3" />
            <path d="M16 4h3a1 1 0 0 1 1 1v3" />
            <path d="M20 16v3a1 1 0 0 1-1 1h-3" />
            <path d="M8 20H5a1 1 0 0 1-1-1v-3" />
            <rect x="9" y="7.5" width="6" height="9" rx="0.5" />
        </Icon>
    );
}

// An Breite anpassen: Pfeile nach links und rechts
export function FitWidthIcon(props) {
    return (
        <Icon {...props}>
            <path d="M3 12h18" />
            <path d="M7 8l-4 4 4 4" />
            <path d="M17 8l4 4-4 4" />
        </Icon>
    );
}

// Ansicht „Scrollen“: Seiten untereinander
export function ScrollIcon(props) {
    return (
        <Icon {...props}>
            <rect x="6" y="2" width="12" height="9" rx="1" />
            <rect x="6" y="13" width="12" height="9" rx="1" />
        </Icon>
    );
}

// Ansicht „Einzelseite“
export function EinzelseiteIcon(props) {
    return (
        <Icon {...props}>
            <rect x="5" y="3" width="14" height="18" rx="1" />
            <path d="M8.5 8h7" />
            <path d="M8.5 12h7" />
            <path d="M8.5 16h7" />
        </Icon>
    );
}

// Ansicht „Doppelseite“
export function DoppelseiteIcon(props) {
    return (
        <Icon {...props}>
            <rect x="2" y="4" width="9" height="16" rx="1" />
            <rect x="13" y="4" width="9" height="16" rx="1" />
        </Icon>
    );
}

// Ansicht „Halbe Seite“: Blatt mit gestrichelter Trennlinie
export function HalbseiteIcon(props) {
    return (
        <Icon {...props}>
            <rect x="5" y="3" width="14" height="18" rx="1" />
            <path d="M3 12h18" strokeDasharray="2.5 2" />
        </Icon>
    );
}

export function VollbildIcon(props) {
    return (
        <Icon {...props}>
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
            <path d="M3 16v3a2 2 0 0 0 2 2h3" />
            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        </Icon>
    );
}

export function VollbildVerlassenIcon(props) {
    return (
        <Icon {...props}>
            <path d="M8 3v3a2 2 0 0 1-2 2H3" />
            <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
            <path d="M3 16h3a2 2 0 0 1 2 2v3" />
            <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
        </Icon>
    );
}
