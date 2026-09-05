import { Router } from "express";
import * as store from "../storage.js";
import { generate, MODELS } from "../groqClient.js";
import {
  SECTIONS,
  buildSectionPrompt,
  buildRegeneratePrompt,
  buildPrdContent,
  parseSectionsFromContent,
} from "../sections.js";

const router = Router();
const defaultModel = () => Object.keys(MODELS)[0];

// Streamed as newline-delimited JSON so the UI can show live per-section progress.
router.post("/generate", async (req, res) => {
  const { name, rawInput, status, tags, strictMode, model } = req.body;

  if (!name?.trim() || !rawInput?.trim()) {
    return res.status(400).json({ error: "name and rawInput are required" });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(400).json({ error: "Server has no GROQ_API_KEY configured." });
  }

  res.setHeader("Content-Type", "application/x-ndjson");
  res.setHeader("Cache-Control", "no-cache");
  const send = (event) => res.write(JSON.stringify(event) + "\n");

  const sectionsContent = {};
  try {
    for (const section of SECTIONS) {
      send({ type: "progress", sectionId: section.id, sectionName: section.name, state: "working" });
      const prompt = buildSectionPrompt({ featureName: name.trim(), rawInput: rawInput.trim(), section, strictMode });
      const content = await generate(prompt, model || defaultModel());
      sectionsContent[section.id] = content;
      send({ type: "progress", sectionId: section.id, sectionName: section.name, state: "done" });
    }

    const prd = store.create({
      name: name.trim(),
      rawInput: rawInput.trim(),
      status: status || "Draft",
      tags: tags || [],
      content: buildPrdContent(name.trim(), sectionsContent),
    });

    send({ type: "complete", prd });
  } catch (err) {
    send({ type: "error", message: err.message || String(err) });
  } finally {
    res.end();
  }
});

router.post("/:id/sections/:sectionId/regenerate", async (req, res) => {
  const prd = store.getById(req.params.id);
  if (!prd) return res.status(404).json({ error: "PRD not found" });

  const section = SECTIONS.find((s) => s.id === req.params.sectionId);
  if (!section) return res.status(404).json({ error: "Section not found" });

  const { feedback, previousContent, model } = req.body;
  if (!feedback?.trim()) return res.status(400).json({ error: "feedback is required" });

  try {
    const prompt = buildRegeneratePrompt({
      featureName: prd.name,
      section,
      previousContent: previousContent || "",
      feedback: feedback.trim(),
    });
    const newContent = await generate(prompt, model || defaultModel());

    const sectionsContent = parseSectionsFromContent(prd.content || "");
    sectionsContent[section.id] = newContent;
    const updated = store.update(prd.id, { content: buildPrdContent(prd.name, sectionsContent) });

    res.json({ sectionContent: newContent, prd: updated });
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

export default router;
