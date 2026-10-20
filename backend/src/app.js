// backend/src/app.js
import cors from "cors";
import express from "express";
import { apiRouter } from "./routes/api_routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api", apiRouter);
