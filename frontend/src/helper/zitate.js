// Zitate für die Startseite – jeden Tag ein anderes.
// Bis auf das erste sind alle mit Werk bzw. Fundstelle belegt.
// Eckige Klammern [ ] markieren Ergänzungen, die im Original nicht stehen.
const ZITATE = [
    {
        // Wird Beethoven oft zugeschrieben, eine Quelle ist aber nicht bekannt.
        text: 'Musik kann die Welt verändern.',
        von: 'Ludwig van Beethoven',
    },
    {
        text: 'Ohne Musik wäre das Leben ein Irrtum.',
        von: 'Friedrich Nietzsche',
        werk: 'Götzen-Dämmerung, 1889',
    },
    {
        text: 'Es ist des Lernens kein Ende.',
        von: 'Robert Schumann',
        werk: 'Musikalische Haus- und Lebensregeln, 1850',
    },
    {
        // Spricht die Figur Serlo, 5. Buch, 1. Kapitel
        text: 'Man sollte alle Tage wenigstens ein kleines Lied hören, ein gutes Gedicht lesen, ein treffliches Gemälde sehen und, wenn es möglich zu machen wäre, einige vernünftige Worte sprechen.',
        von: 'Johann Wolfgang von Goethe',
        werk: 'Wilhelm Meisters Lehrjahre, 1795/96',
    },
    {
        text: 'Von Herzen – möge es wieder – zu Herzen gehn!',
        von: 'Ludwig van Beethoven',
        werk: 'Widmung in der Partitur der Missa solemnis',
    },
    {
        text: 'Spiele immer, als hörte dir ein Meister zu.',
        von: 'Robert Schumann',
        werk: 'Musikalische Haus- und Lebensregeln, 1850',
    },
    {
        text: 'Das, was mir eine Musik ausspricht, die ich liebe, sind mir nicht zu unbestimmte Gedanken, um sie in Worte zu fassen, sondern zu bestimmte.',
        von: 'Felix Mendelssohn Bartholdy',
        werk: 'Brief an Marc-André Souchay, 1842',
    },
    {
        // Über die Oper „Die Entführung aus dem Serail“; Satzanfang ausgelassen
        text: '… die Musik auch in der schaudervollsten Lage das Ohr niemalen beleidigen, sondern doch dabei vergnügen, folglich allzeit Musik bleiben muß.',
        von: 'Wolfgang Amadeus Mozart',
        werk: 'Brief an den Vater, 26. September 1781',
    },
    {
        text: 'Tönend bewegte Formen sind einzig und allein Inhalt und Gegenstand der Musik.',
        von: 'Eduard Hanslick',
        werk: 'Vom Musikalisch-Schönen, 1854',
    },
    {
        text: 'Singe fleißig im Chor mit, namentlich Mittelstimmen. Dies macht dich musikalisch.',
        von: 'Robert Schumann',
        werk: 'Musikalische Haus- und Lebensregeln, 1850',
    },
    {
        text: 'Die Instrumentalmusik ist die romantischste aller Künste.',
        von: 'E. T. A. Hoffmann',
        werk: 'Rezension von Beethovens 5. Sinfonie, 1810',
    },
];

// Gibt das Zitat für den heutigen Tag zurück.
// Gleiches Datum → gleiches Zitat; um Mitternacht (Ortszeit) kommt das nächste.
export function zitatDesTages(datum = new Date()) {
    const tag = Math.floor(
        Date.UTC(datum.getFullYear(), datum.getMonth(), datum.getDate()) / 86_400_000
    );
    return ZITATE[tag % ZITATE.length];
}
