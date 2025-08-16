import express from "express";
import { getResume } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/get-resume", getResume);

export default router