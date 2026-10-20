// backend/src/index.js
import { app } from "./app.js";

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Notenregal-Backend läuft auf http://localhost:${port}`);
});
