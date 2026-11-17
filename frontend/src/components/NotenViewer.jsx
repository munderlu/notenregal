import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { getSongDetails, getNoten, getNotenUrl } from "../helper/api";
import {
    CloseIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon,
    ZoomInIcon, ZoomOutIcon, FitPageIcon, FitWidthIcon,
    ScrollIcon, EinzelseiteIcon, DoppelseiteIcon, HalbseiteIcon,
    VollbildIcon, VollbildVerlassenIcon,
} from "./Icons";

// pdf.js parst die PDFs in einem Web Worker, damit die Oberfläche flüssig bleibt
GlobalWorkerOptions.workerSrc = workerUrl;

const ZOOM_STUFEN = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
const RAND = 16;            // Abstand der Seiten zum Rand des Viewers (px)
const LUECKE = 16;          // Abstand zwischen zwei Seiten (px)
const MAX_PIXEL = 16e6;     // größere Canvas-Flächen machen manche Browser nicht mit

// Zusatzdateien von pdf.js (siehe vite.config.js) – ohne die Decoder bleiben z. B. Scans weiß
const PDFJS_DATEIEN = {
    wasmUrl: '/pdfjs/wasm/',
    cMapUrl: '/pdfjs/cmaps/',
    standardFontDataUrl: '/pdfjs/standard_fonts/',
    iccUrl: '/pdfjs/iccs/',
};

const ANSICHTEN = [
    { id: 'scrollen', label: 'Scrollen', text: 'Alle Seiten untereinander', Icon: ScrollIcon },
    { id: 'einzel', label: 'Einzelseite', text: 'Eine Seite, ganz umblättern', Icon: EinzelseiteIcon },
    { id: 'doppel', label: 'Doppelseite', text: 'Zwei Seiten nebeneinander', Icon: DoppelseiteIcon },
    { id: 'halb', label: 'Halbe Seite', text: 'Oben schon die nächste Seite', Icon: HalbseiteIcon },
];

// Die gewählte Ansicht merkt sich der Browser – fehlt der Speicher, gibt es den Standard
const SPEICHER_ANSICHT = 'notenregal.ansicht';

function gespeicherteAnsicht() {
    try {
        const gespeichert = localStorage.getItem(SPEICHER_ANSICHT);
        if (ANSICHTEN.some(a => a.id === gespeichert)) return gespeichert;
    } catch { /* kein Speicher verfügbar */ }
    return 'scrollen';
}

function speichereAnsicht(ansicht) {
    try {
        localStorage.setItem(SPEICHER_ANSICHT, ansicht);
    } catch { /* kein Speicher verfügbar */ }
}

// Vollbild – Safari auf dem iPad kennt nur die webkit-Variante, das iPhone gar keine
const vollbildMoeglich = typeof document !== 'undefined'
    && (document.fullscreenEnabled || document.webkitFullscreenEnabled);
const vollbildElement = () => document.fullscreenElement ?? document.webkitFullscreenElement ?? null;

/*
 * Vollbild-Ansicht für ein Noten-PDF.
 * Route: /songs/:song_id/noten/:noten_id
 *
 * Ansichten: Scrollen, Einzelseite, Doppelseite und Halbe Seite (halbseitig blättern).
 * In den Blätter-Ansichten: rechts tippen/nach links wischen = weiter, links = zurück.
 * Tastatur (und Blätter-Pedale): →/Bild↓ weiter, ←/Bild↑ zurück, +/− zoomen, Esc schließt.
 */
export default function NotenViewer() {
    const { song_id, noten_id } = useParams();
    const navigate = useNavigate();

    const [song, setSong] = useState(null);
    const [alleNoten, setAlleNoten] = useState([]);
    const [seiten, setSeiten] = useState([]);
    const [error, setError] = useState(null);
    const [ansicht, setAnsicht] = useState(gespeicherteAnsicht);
    const [zoom, setZoom] = useState('seite');      // nur beim Scrollen: 'seite' | 'breite' | Zahl
    const [platz, setPlatz] = useState({ breite: 0, hoehe: 0 });
    const [seite, setSeite] = useState(0);           // aktuelle Seite (0-basiert)
    const [halb, setHalb] = useState(false);         // halbseitig: oben schon die nächste Seite
    const [vollbild, setVollbild] = useState(false);

    const viewerRef = useRef(null);
    const scrollRef = useRef(null);
    const seitenRefs = useRef([]);
    const seiteRef = useRef(0);
    useLayoutEffect(() => { seiteRef.current = seite; });

    const n = seiten.length;
    const geblaettert = ansicht !== 'scrollen';
    const noten = alleNoten.find(x => x.noten_id === Number(noten_id));

    const schliessen = useCallback(() => navigate(`/songs/${song_id}`), [navigate, song_id]);

    // Song und alle Noten laden (für Titel und Instrument-Wechsel)
    useEffect(() => {
        let aktiv = true;
        Promise.all([getSongDetails(song_id), getNoten(song_id)])
            .then(([s, liste]) => {
                if (!aktiv) return;
                setSong(s);
                setAlleNoten([...liste].sort((a, b) => a.instrument.localeCompare(b.instrument, 'de')));
            })
            .catch(() => aktiv && setError('Diese Noten gibt es nicht (mehr).'));
        return () => { aktiv = false; };
    }, [song_id]);

    // PDF laden und alle Seiten vorbereiten
    useEffect(() => {
        let aktiv = true;
        setSeiten([]);
        setError(null);
        setSeite(0);
        setHalb(false);
        scrollRef.current?.scrollTo(0, 0);

        const task = getDocument({ url: getNotenUrl(noten_id), ...PDFJS_DATEIEN });
        task.promise
            .then(pdf => Promise.all(
                Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1))
            ))
            .then(pages => aktiv && setSeiten(pages))
            .catch(err => {
                if (!aktiv) return;
                console.error('PDF-Fehler:', err);
                setError('Das PDF konnte nicht geladen werden.');
            });

        return () => {
            aktiv = false;
            task.destroy();
        };
    }, [noten_id]);

    // Verfügbaren Platz beobachten, damit die Seiten beim Größe-Ändern mitgehen
    useEffect(() => {
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setPlatz({ breite: width, hoehe: height });
        });
        observer.observe(scrollRef.current);
        return () => observer.disconnect();
    }, []);

    // Seite hinter dem Viewer nicht mitscrollen lassen und Fokus für die Tastatur setzen
    useEffect(() => {
        const vorher = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        scrollRef.current?.focus();
        return () => { document.body.style.overflow = vorher; };
    }, []);

    // Vollbild-Zustand mitverfolgen (auch wenn der Browser es per Esc beendet)
    // und beim Schließen des Viewers wieder verlassen
    useEffect(() => {
        const aktualisieren = () => setVollbild(vollbildElement() === viewerRef.current);
        document.addEventListener('fullscreenchange', aktualisieren);
        document.addEventListener('webkitfullscreenchange', aktualisieren);
        return () => {
            document.removeEventListener('fullscreenchange', aktualisieren);
            document.removeEventListener('webkitfullscreenchange', aktualisieren);
            if (vollbildElement()) (document.exitFullscreen ?? document.webkitExitFullscreen)?.call(document);
        };
    }, []);

    const vollbildUmschalten = () => {
        const el = viewerRef.current;
        if (vollbildElement()) {
            (document.exitFullscreen ?? document.webkitExitFullscreen).call(document);
        } else {
            (el.requestFullscreen ?? el.webkitRequestFullscreen).call(el);
        }
    };

    // ---------- Maßstab ----------
    const basis = seiten[0]?.getViewport({ scale: 1 });
    let scale = typeof zoom === 'number' && !geblaettert ? zoom : 1;
    if (basis && platz.breite > 0 && !(typeof zoom === 'number' && !geblaettert)) {
        const breite = platz.breite - 2 * RAND;
        const hoehe = platz.hoehe - 2 * RAND;
        const spalten = ansicht === 'doppel' ? 2 : 1;
        const nachBreite = (breite - (spalten - 1) * LUECKE) / (spalten * basis.width);
        const nachHoehe = hoehe / basis.height;
        scale = !geblaettert && zoom === 'breite' ? nachBreite : Math.min(nachBreite, nachHoehe);
        scale = Math.max(scale, 0.1);
    }

    // Beim Scrollen: nach Zoom oder Ansichtswechsel auf der aktuellen Seite bleiben
    useLayoutEffect(() => {
        if (ansicht !== 'scrollen') return;
        seitenRefs.current[seiteRef.current]?.scrollIntoView({ block: 'start' });
    }, [scale, ansicht]);

    const handleScroll = () => {
        if (geblaettert) return;
        const c = scrollRef.current;
        const marke = c.scrollTop + c.clientHeight / 3;
        let aktuell = 0;
        seitenRefs.current.forEach((el, i) => {
            if (el && i < n && el.offsetTop <= marke) aktuell = i;
        });
        setSeite(aktuell);
    };

    // ---------- Blättern ----------
    const amAnfang = seite === 0 && !halb;
    // Doppelseite blättert auch nur um eine Seite, zeigt aber am Ende immer zwei
    const amEnde = ansicht === 'doppel' ? seite >= n - 2 : seite >= n - 1;

    const weiter = () => {
        if (amEnde) return;
        if (ansicht === 'scrollen') {
            seitenRefs.current[seite + 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (ansicht === 'halb' && !halb) {
            setHalb(true);
        } else {
            setSeite(seite + 1);
            setHalb(false);
        }
    };

    const zurueck = () => {
        if (amAnfang) return;
        if (ansicht === 'scrollen') {
            seitenRefs.current[seite - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (ansicht === 'halb' && halb) {
            setHalb(false);
        } else if (ansicht === 'halb') {
            setSeite(seite - 1);
            setHalb(true);
        } else {
            setSeite(seite - 1);
        }
    };

    const waehleAnsicht = (neu) => {
        setAnsicht(neu);
        setHalb(false);
        speichereAnsicht(neu);
    };

    const zoomen = (richtung) => {
        if (geblaettert) return;
        const naechste = richtung > 0
            ? ZOOM_STUFEN.find(z => z > scale + 0.01) ?? ZOOM_STUFEN.at(-1)
            : ZOOM_STUFEN.findLast(z => z < scale - 0.01) ?? ZOOM_STUFEN[0];
        setZoom(naechste);
    };

    // Tastatur – auch Blätter-Pedale senden Pfeil- bzw. Bild-Tasten
    const handleTaste = (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const tag = e.target.tagName;
        if (tag === 'SELECT') return;
        const aufBedienelement = tag === 'BUTTON' || tag === 'A';

        const vor = ['ArrowRight', 'PageDown'];
        const rueck = ['ArrowLeft', 'PageUp'];
        if (geblaettert) {
            vor.push('ArrowDown');
            rueck.push('ArrowUp');
            if (!aufBedienelement) (e.shiftKey ? rueck : vor).push(' ');
        }

        if (e.key === 'Escape') schliessen();
        else if (vor.includes(e.key)) { e.preventDefault(); weiter(); }
        else if (rueck.includes(e.key)) { e.preventDefault(); zurueck(); }
        else if (e.key === '+' || e.key === '=') zoomen(1);
        else if (e.key === '-') zoomen(-1);
        else if (e.key === 'f' && vollbildMoeglich) vollbildUmschalten();
    };

    const tastenRef = useRef(handleTaste);
    useLayoutEffect(() => { tastenRef.current = handleTaste; });

    useEffect(() => {
        const handleKey = (e) => tastenRef.current(e);
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    // Tippen und Wischen in den Blätter-Ansichten
    const geste = useRef(null);
    const finger = useRef(new Set());

    const handlePointerDown = (e) => {
        finger.current.add(e.pointerId);
        if (e.button !== 0) return;
        // Zweiter Finger (z. B. Zoomen mit zwei Fingern) – dann kein Blättern
        geste.current = finger.current.size > 1 ? null : { x: e.clientX, y: e.clientY, t: Date.now() };
    };

    const handlePointerUp = (e) => {
        finger.current.delete(e.pointerId);
        const g = geste.current;
        geste.current = null;
        if (!g) return;

        const dx = e.clientX - g.x;
        const dy = e.clientY - g.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) {
            if (dx < 0) weiter(); else zurueck();
        } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && Date.now() - g.t < 500) {
            const rect = e.currentTarget.getBoundingClientRect();
            if (e.clientX - rect.left < rect.width / 2) zurueck(); else weiter();
        }
    };

    const handlePointerCancel = (e) => {
        finger.current.delete(e.pointerId);
        geste.current = null;
    };

    // ---------- Anzeige ----------
    const titel = [song?.title, noten?.instrument].filter(Boolean).join(' – ');
    const zweiSeiten = (ansicht === 'doppel' || (ansicht === 'halb' && halb)) && seite + 1 < n;
    const seitenAnzeige = zweiSeiten ? `${seite + 1}–${seite + 2}` : `${seite + 1}`;

    return (
        <div
            ref={viewerRef}
            className="viewer"
            role="region"
            aria-label={titel ? `Noten: ${titel}` : 'Noten'}
        >
            <header className="viewer__leiste">
                <button
                    type="button"
                    className="btn btn--ghost btn--icon"
                    onClick={schliessen}
                    aria-label="Schließen"
                    title="Schließen (Esc)"
                >
                    <CloseIcon />
                </button>

                <div className="viewer__titel">
                    {song && <span className="viewer__song">{song.title}</span>}
                    {alleNoten.length > 1 ? (
                        <select
                            className="viewer__instrument"
                            value={noten_id}
                            onChange={e => navigate(`/songs/${song_id}/noten/${e.target.value}`, { replace: true })}
                            aria-label="Instrument wählen"
                        >
                            {alleNoten.map(x => (
                                <option key={x.noten_id} value={x.noten_id}>{x.instrument}</option>
                            ))}
                        </select>
                    ) : (
                        noten && <span className="viewer__instrument">{noten.instrument}</span>
                    )}
                </div>

                {n > 1 && (
                    <nav className="viewer__blaettern" aria-label="Seiten">
                        <button
                            type="button"
                            className="btn btn--ghost btn--icon"
                            onClick={zurueck}
                            disabled={amAnfang}
                            aria-label="Zurück"
                            title="Zurück (←)"
                        >
                            <ChevronLeftIcon />
                        </button>
                        <span className="viewer__seitenzahl" aria-live="polite">
                            {seitenAnzeige}<span className="viewer__seitenzahl-gesamt"> / {n}</span>
                        </span>
                        <button
                            type="button"
                            className="btn btn--ghost btn--icon"
                            onClick={weiter}
                            disabled={amEnde}
                            aria-label="Weiter"
                            title="Weiter (→)"
                        >
                            <ChevronRightIcon />
                        </button>
                    </nav>
                )}

                <div className="viewer__werkzeuge">
                    {!geblaettert && (
                        <div className="viewer__zoomgruppe">
                            <button
                                type="button"
                                className="btn btn--ghost btn--icon"
                                onClick={() => zoomen(-1)}
                                aria-label="Verkleinern"
                                title="Verkleinern (−)"
                            >
                                <ZoomOutIcon />
                            </button>
                            <span className="viewer__zoom">{Math.round(scale * 100)} %</span>
                            <button
                                type="button"
                                className="btn btn--ghost btn--icon"
                                onClick={() => zoomen(1)}
                                aria-label="Vergrößern"
                                title="Vergrößern (+)"
                            >
                                <ZoomInIcon />
                            </button>
                            {zoom === 'breite' ? (
                                <button
                                    type="button"
                                    className="btn btn--ghost btn--icon"
                                    onClick={() => setZoom('seite')}
                                    aria-label="Ganze Seite anzeigen"
                                    title="Ganze Seite anzeigen"
                                >
                                    <FitPageIcon />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn--ghost btn--icon"
                                    onClick={() => setZoom('breite')}
                                    aria-label="An Seitenbreite anpassen"
                                    title="An Seitenbreite anpassen"
                                >
                                    <FitWidthIcon />
                                </button>
                            )}
                        </div>
                    )}
                    {vollbildMoeglich && (
                        <button
                            type="button"
                            className="btn btn--ghost btn--icon"
                            onClick={vollbildUmschalten}
                            aria-label={vollbild ? 'Vollbild beenden' : 'Vollbild'}
                            title={vollbild ? 'Vollbild beenden (F)' : 'Vollbild (F)'}
                        >
                            {vollbild ? <VollbildVerlassenIcon /> : <VollbildIcon />}
                        </button>
                    )}
                    <AnsichtMenue
                        ansicht={ansicht}
                        onWaehle={waehleAnsicht}
                        downloadUrl={getNotenUrl(noten_id, true)}
                    />
                </div>
            </header>

            <div
                ref={scrollRef}
                className={`viewer__flaeche${geblaettert ? ' viewer__flaeche--geblaettert' : ''}`}
                onScroll={handleScroll}
                onPointerDown={geblaettert ? handlePointerDown : undefined}
                onPointerUp={geblaettert ? handlePointerUp : undefined}
                onPointerCancel={geblaettert ? handlePointerCancel : undefined}
                tabIndex={0}
            >
                {error && <p className="alert viewer__meldung" role="alert">{error}</p>}
                {!error && n === 0 && <p className="viewer__meldung viewer__laden">PDF wird geladen …</p>}

                {n > 0 && !geblaettert && (
                    <div className="viewer__seiten" key={noten_id}>
                        {seiten.map((page, i) => (
                            <PdfSeite
                                key={i}
                                page={page}
                                scale={scale}
                                nummer={i + 1}
                                seiteRef={el => { seitenRefs.current[i] = el; }}
                            />
                        ))}
                    </div>
                )}

                {n > 0 && geblaettert && (
                    <Buehne
                        key={noten_id}
                        seiten={seiten}
                        scale={scale}
                        ansicht={ansicht}
                        seite={Math.min(seite, n - 1)}
                        halb={halb}
                    />
                )}
            </div>
        </div>
    );
}

/*
 * Bühne für die Blätter-Ansichten. Alle Seiten liegen absolut übereinander;
 * welche zu sehen ist, steuern Position, clip-path und visibility.
 * Die Nachbarseiten sind schon gerendert, aber versteckt – so blättert es ohne Verzögerung.
 */
function Buehne({ seiten, scale, ansicht, seite, halb }) {
    const n = seiten.length;
    const vp = i => seiten[i].getViewport({ scale });
    const breite = i => Math.floor(vp(i).width);
    const hoehe = i => Math.floor(vp(i).height);

    const sichtbar = [];
    if (ansicht === 'doppel') {
        sichtbar.push({ i: seite, left: 0 });
        if (seite + 1 < n) sichtbar.push({ i: seite + 1, left: breite(seite) + LUECKE });
    } else if (ansicht === 'halb' && halb && seite + 1 < n) {
        // Oben schon die obere Hälfte der nächsten Seite, unten noch die untere der aktuellen
        sichtbar.push({ i: seite + 1, left: 0, clip: 'inset(0 0 50% 0)' });
        sichtbar.push({ i: seite, left: 0, clip: 'inset(50% 0 0 0)' });
    } else {
        sichtbar.push({ i: seite, left: 0 });
    }

    const vorladen = (ansicht === 'doppel'
        ? [seite - 1, seite + 2]
        : [seite - 1, seite + 1, seite + 2]
    ).filter(i => i >= 0 && i < n && !sichtbar.some(s => s.i === i));

    const buehnenBreite = Math.max(...sichtbar.map(s => s.left + breite(s.i)));
    const buehnenHoehe = Math.max(...sichtbar.map(s => hoehe(s.i)));

    const alle = [
        ...sichtbar,
        ...vorladen.map(i => ({ i, left: 0, versteckt: true })),
    ].sort((a, b) => a.i - b.i);

    return (
        <div className="viewer__buehne" style={{ width: buehnenBreite, height: buehnenHoehe }}>
            {alle.map(s => (
                <PdfSeite
                    key={s.i}
                    page={seiten[s.i]}
                    scale={scale}
                    nummer={s.i + 1}
                    immer
                    versteckt={s.versteckt}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: s.left,
                        clipPath: s.clip,
                        visibility: s.versteckt ? 'hidden' : undefined,
                    }}
                />
            ))}
            {ansicht === 'halb' && halb && <div className="viewer__trenner" aria-hidden="true" />}
        </div>
    );
}

// Menü für Ansicht und Download
function AnsichtMenue({ ansicht, onWaehle, downloadUrl }) {
    const [offen, setOffen] = useState(false);
    const ref = useRef(null);
    const Aktuell = ANSICHTEN.find(a => a.id === ansicht).Icon;

    useEffect(() => {
        if (!offen) return;
        const aussen = (e) => {
            if (!ref.current.contains(e.target)) setOffen(false);
        };
        // Esc schließt nur das Menü, nicht den ganzen Viewer
        const esc = (e) => {
            if (e.key !== 'Escape') return;
            e.stopImmediatePropagation();
            setOffen(false);
        };
        document.addEventListener('pointerdown', aussen);
        window.addEventListener('keydown', esc, true);
        return () => {
            document.removeEventListener('pointerdown', aussen);
            window.removeEventListener('keydown', esc, true);
        };
    }, [offen]);

    return (
        <div className="viewer__menue" ref={ref}>
            <button
                type="button"
                className="btn btn--ghost btn--icon"
                onClick={() => setOffen(o => !o)}
                aria-haspopup="menu"
                aria-expanded={offen}
                aria-label="Ansicht"
                title="Ansicht"
            >
                <Aktuell />
            </button>
            {offen && (
                <div className="viewer__menue-liste" role="menu">
                    {ANSICHTEN.map(({ id, label, text, Icon }) => (
                        <button
                            key={id}
                            type="button"
                            role="menuitemradio"
                            aria-checked={ansicht === id}
                            className="viewer__menue-eintrag"
                            onClick={() => { onWaehle(id); setOffen(false); }}
                        >
                            <Icon />
                            <span>
                                <span className="viewer__menue-label">{label}</span>
                                <span className="viewer__menue-text">{text}</span>
                            </span>
                        </button>
                    ))}
                    <hr className="viewer__menue-linie" />
                    <a
                        role="menuitem"
                        href={downloadUrl}
                        className="viewer__menue-eintrag"
                        onClick={() => setOffen(false)}
                    >
                        <DownloadIcon />
                        <span className="viewer__menue-label">Herunterladen</span>
                    </a>
                </div>
            )}
        </div>
    );
}

// Eine PDF-Seite. Beim Scrollen wird erst gerendert, wenn sie in die Nähe des
// sichtbaren Bereichs kommt; mit `immer` sofort (Blätter-Ansichten).
function PdfSeite({ page, scale, nummer, seiteRef, immer = false, versteckt = false, style }) {
    const wrapRef = useRef(null);
    const canvasRef = useRef(null);
    const gerendert = useRef(null);
    const [sichtbar, setSichtbar] = useState(false);

    const viewport = page.getViewport({ scale });
    const rendern = sichtbar || immer;

    useEffect(() => {
        if (immer) return;
        const observer = new IntersectionObserver(
            ([entry]) => setSichtbar(entry.isIntersecting),
            { rootMargin: '100% 0px' }
        );
        observer.observe(wrapRef.current);
        return () => observer.disconnect();
    }, [immer]);

    useEffect(() => {
        if (!rendern || gerendert.current === scale) return;

        // Für scharfe Darstellung auf HiDPI-Bildschirmen mit Pixeldichte rendern
        const basis = page.getViewport({ scale });
        let faktor = window.devicePixelRatio || 1;
        if (basis.width * basis.height * faktor * faktor > MAX_PIXEL) {
            faktor = Math.sqrt(MAX_PIXEL / (basis.width * basis.height));
        }
        const vp = page.getViewport({ scale: scale * faktor });

        // Erst unsichtbar rendern, dann übertragen – so flackert es beim Zoomen nicht
        const temp = document.createElement('canvas');
        temp.width = Math.floor(vp.width);
        temp.height = Math.floor(vp.height);

        let aktiv = true;
        const task = page.render({ canvas: temp, viewport: vp });
        task.promise
            .then(() => {
                const canvas = canvasRef.current;
                if (!aktiv || !canvas) return;
                canvas.width = temp.width;
                canvas.height = temp.height;
                canvas.getContext('2d').drawImage(temp, 0, 0);
                gerendert.current = scale;
            })
            .catch(err => {
                if (err?.name !== 'RenderingCancelledException') console.error('Render-Fehler:', err);
            });

        return () => {
            aktiv = false;
            task.cancel();
        };
    }, [rendern, scale, page]);

    return (
        <div
            ref={el => { wrapRef.current = el; seiteRef?.(el); }}
            className="viewer__seite"
            style={{ width: Math.floor(viewport.width), height: Math.floor(viewport.height), ...style }}
            aria-label={`Seite ${nummer}`}
            aria-hidden={versteckt || undefined}
        >
            <canvas ref={canvasRef} />
        </div>
    );
}
