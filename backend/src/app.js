// backend/src/app.js
import express from "express";
import { apiRouter } from "./routes/api_routes.js";

export const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api", apiRouter);
