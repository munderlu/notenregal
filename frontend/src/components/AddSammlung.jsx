import { useContext } from "react";
import { AppContext } from "./AppContext";
import { addSammlung } from "../helper/api";
import UpdateDialogue from "./UpdateDialogue";
import { PlusIcon } from "./Icons";
import { sammlungFields } from "./SammlungenList";

// „Neue Sammlung“-Button mit Dialog. Ein Suchbegriff wird als Name vorausgefüllt.
export default function AddSammlung({ initialName = '', onCreated }) {
    const { setSammlungen } = useContext(AppContext);

    const handleAdd = async ({ name }) => {
        const neueSammlung = await addSammlung({ name: name.trim() });

        setSammlungen(prev => [...prev, neueSammlung]);
        onCreated?.(neueSammlung);
    };

    return (
        <UpdateDialogue
            fields={sammlungFields}
            initialValues={{ name: initialName }}
            onSave={handleAdd}
            title="Neue Sammlung"
            submitLabel="Sammlung anlegen"
            trigger="primary"
            triggerLabel="Neue Sammlung"
            triggerIcon={PlusIcon}
        />
    );
}
