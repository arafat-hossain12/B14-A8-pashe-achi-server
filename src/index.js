import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import eventsRouter from "./routes/events.js";
import joinsRouter from "./routes/joins.js";

const app = express();
const allowed = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());

app.use(cors({ origin: allowed }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => res.json({ name: "Pashe Achi API", status: "running" }));
app.use("/api", eventsRouter);
app.use("/api", joinsRouter);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`Server running on port ${port}`)))
  .catch((e) => {
    console.error("MongoDB connection failed:", e.message);
    process.exit(1);
  });
