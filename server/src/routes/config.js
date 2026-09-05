import { Router } from "express";
import { MODELS } from "../groqClient.js";
import { SECTIONS } from "../sections.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    models: MODELS,
    sections: SECTIONS.map(({ id, name, icon }) => ({ id, name, icon })),
    apiKeyConfigured: !!process.env.GROQ_API_KEY,
  });
});

export default router;
