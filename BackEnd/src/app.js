// src/app.js
import express from "express";
import aiRoutes from "./routes/ai.routes.js";
import cors from "cors";

const app = express();

// ✅ Enable CORS first
app.use(cors());

// ✅ Parse JSON bodies
app.use(express.json());

// ✅ Routes
app.use("/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

export default app;
