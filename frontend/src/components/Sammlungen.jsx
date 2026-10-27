import AddSammlung from "./AddSammlung";
import SammlungenList from "./SammlungenList";

export default function Sammlungen() {
    return (
        <div className="Sammlungen page-stack">
            <h1 className="page-title">Sammlungen</h1>
            <AddSammlung />
            <SammlungenList />
        </div>
    )
}
