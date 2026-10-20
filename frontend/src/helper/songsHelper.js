export const addSong = async (e, setSongs, setError) => {
    e.preventDefault();
    const form = e.target;
    const title = form.elements.title.value;
    const composer = form.elements.composer.value;

    try {
        const response = await fetch('/api/songs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, composer }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const newSong = await response.json();
        setSongs((prev) => [...prev, newSong].sort((a, b) => a.title.localeCompare(b.title)));
        setError(null);
        form.reset();
    } catch (err) {
        console.error('Error adding song:', err);
        setError('Song konnte nicht hinzugefügt werden.');
    }
};

export const deleteSong = async (songId, setSongs, setError) => {
    try {
        const confirmed = window.confirm('Möchten Sie diesen Song wirklich löschen?');
        if (!confirmed) return;

        const response = await fetch(`/api/songs/${songId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        setSongs((prev) => prev.filter((song) => song.song_id !== songId));
    }
    catch (err) {
        console.error('Error deleting song:', err);
        setError('Song konnte nicht gelöscht werden.');
    }
};
