// backend/src/app.js
import cors from "cors";
import express from "express";
import { songsRouter } from "./routes/song_routes.js";
import { sammlungsRouter } from "./routes/sammlung_routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/songs", songsRouter);
app.use("/api/sammlungen", sammlungsRouter);
