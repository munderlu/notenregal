import { useContext } from "react";
import { AppContext } from "./AppContext";
import { addSong } from "../helper/api";
import UpdateDialogue from "./UpdateDialogue";
import { PlusIcon } from "./Icons";
import { songFields } from "./SongList";

// „Neuer Song“-Button mit Dialog. Ein Suchbegriff wird als Titel vorausgefüllt.
export default function AddSong({ initialTitle = '', onCreated }) {
    const { setSongs } = useContext(AppContext);

    const handleAdd = async ({ title, composer }) => {
        const neuerSong = await addSong({ title: title.trim(), composer: composer?.trim() || undefined });

        setSongs(prev => [...prev, neuerSong]);
        onCreated?.(neuerSong);
    };

    return (
        <UpdateDialogue
            fields={songFields}
            initialValues={{ title: initialTitle, composer: '' }}
            onSave={handleAdd}
            title="Neuer Song"
            submitLabel="Song anlegen"
            trigger="primary"
            triggerLabel="Neuer Song"
            triggerIcon={PlusIcon}
        />
    );
}
