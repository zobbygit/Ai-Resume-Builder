
import aiService from "../services/ai.service.js";

export const getResume = async (req, res) => {
  const resumePrompt = req.body.resumePrompt;

  if (!resumePrompt) {
    return res.status(400).send("Prompt is required");
  }

  const response = await aiService(resumePrompt);
  res.send(response);
};