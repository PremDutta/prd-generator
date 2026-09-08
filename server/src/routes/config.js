import { Router } from "express";
import { availableModels, defaultModelKey } from "../providers.js";
import { TEMPLATES } from "../templates/index.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    models: availableModels(),
    defaultModel: defaultModelKey(),
    templates: Object.fromEntries(
      Object.values(TEMPLATES).map((t) => [
        t.id,
        {
          id: t.id,
          name: t.name,
          description: t.description,
          sections: t.sections.map(({ id, name, icon, generated }) => ({ id, name, icon, generated })),
        },
      ])
    ),
    groqKeyConfigured: !!process.env.GROQ_API_KEY,
    anthropicKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
  });
});

export default router;
