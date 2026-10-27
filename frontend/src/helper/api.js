export async function getAllSongs() {
    try {
        const response = await fetch(`/api/songs`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    }
    catch (err) {
        console.error('Error fetching songs:', err);
        throw err;
    }
}

export async function getAllSammlungen() {
    try {
        const response = await fetch(`/api/sammlungen`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    }
    catch (err) {
        console.error('Error fetching sammlungen:', err);
        throw err;
    }
}

// ---------------------------- Songs -------------------------------------------

export async function getSongDetails(song_id) {
    try {
        const response = await fetch(`/api/songs/${song_id}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        return await response.json();
    } catch (err) {
        console.error('Error fetching song details');
        throw err;
    }
}

export async function addSong(values) {
    try {
        const response = await fetch('/api/songs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values)
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        return await response.json();
    } catch (err) {
        console.error("Error adding song: ", err);
        throw err;
    }
}

export async function deleteSong(song_id) {
    try {
        const confirmed = window.confirm('Möchten Sie diesen Song wirklich löschen?');
        if (!confirmed) return 0;

        const response = await fetch(`api/songs/${song_id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return 1;
    } catch (err) {
        console.error("Error deleting song: ", err);
        throw err;
    }
}
export async function updateSong(song_id, values) {
    try {
        const response = await fetch(`api/songs/${song_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        return await response.json();
    } catch (err) {
        console.error("Error updating songs: ", err);
        throw err;
    }
}

// ---------------------------- Sammlungen -------------------------------------------

export async function addSammlung(values) {
    try {
        const response = await fetch('/api/sammlungen', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        return await response.json();
    } catch (err) {
        console.error('Error adding Sammlung: ', err);
        throw (err);
    }
}

export async function deleteSammlung(sammlung_id) {
    try {
        const confirmed = window.confirm('Möchten Sie diese Sammlung wirklich löschen?');
        if (!confirmed) return 0;

        const response = await fetch(`api/sammlungen/${sammlung_id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return 1;
    } catch (err) {
        console.error("Error deleting sammlung: ", err);
        throw err;
    }
}
export async function updateSammlung(sammlung_id, values) {
    try {
        const response = await fetch(`api/sammlungen/${sammlung_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        return await response.json();
    } catch (err) {
        console.error("Error updating sammlung: ", err);
        throw err;
    }
}
