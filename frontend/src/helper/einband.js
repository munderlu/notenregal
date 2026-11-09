// Jede Sammlung bekommt eine feste Einbandfarbe und Rückenhöhe,
// abgeleitet aus ihrer ID – so sieht das Regal bei jedem Besuch gleich aus.

const FARBEN = 6;

export function einbandFarbe(sammlung_id) {
    return `var(--spine-${(sammlung_id % FARBEN) + 1})`;
}

// Höhe in Prozent der maximalen Rückenhöhe (zwischen 82 % und 100 %)
export function einbandHoehe(sammlung_id) {
    const pseudoZufall = (sammlung_id * 37) % 7;
    return 82 + pseudoZufall * 3;
}

// Breite des Buchrückens in rem (dünne, normale und dicke Bände)
export function einbandBreite(sammlung_id) {
    return [3.25, 2.75, 3.75, 3.25, 3][(sammlung_id * 13) % 5];
}
