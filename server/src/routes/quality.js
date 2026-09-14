import { Router } from "express";
import * as store from "../storage.js";
import { getTemplate } from "../templates/index.js";
import { scorePrd } from "../quality.js";

const router = Router();

router.get("/:id/score", (req, res) => {
  const prd = store.getById(req.params.id);
  if (!prd) return res.status(404).json({ error: "PRD not found" });
  res.json(scorePrd(prd, getTemplate(prd.templateId)));
});

export default router;
