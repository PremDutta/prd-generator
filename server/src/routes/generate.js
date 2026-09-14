import { Router } from "express";
import * as store from "../storage.js";
import { generate, availableModels, defaultModelKey } from "../providers.js";
import { getTemplate } from "../templates/index.js";
import {
  buildSectionPrompt,
  buildRegeneratePrompt,
  buildPrdContent,
  buildClarifyPrompt,
  parseClarifyResponse,
} from "../templates/index.js";

const router = Router();

function resolveModel(model) {
  const modelKey = model || defaultModelKey();
  if (!modelKey || !availableModels()[modelKey]) return null;
  return modelKey;
}

const NO_PROVIDER = "No AI provider configured. Set GROQ_API_KEY or ANTHROPIC_API_KEY in server/.env.";

// Asks the author a few targeted questions up front so generation starts with
// real numbers rather than emitting placeholders to be backfilled later.
router.post("/clarify", async (req, res) => {
  const { name, rawInput, templateId, model } = req.body;
  if (!name?.trim() || !rawInput?.trim()) {
    return res.status(400).json({ error: "name and rawInput are required" });
  }

  const modelKey = resolveModel(model);
  if (!modelKey) return res.status(400).json({ error: NO_PROVIDER });

  const template = getTemplate(templateId);
  try {
    const prompt = buildClarifyPrompt({
      featureName: name.trim(),
      rawInput: rawInput.trim(),
      sectionNames: template.sections.filter((s) => s.generated !== false).map((s) => s.name),
    });
    const questions = parseClarifyResponse(await generate(prompt, modelKey));
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Streamed as newline-delimited JSON so the UI can show live per-section progress.
router.post("/generate", async (req, res) => {
  const { name, rawInput, status, tags, strictMode, model, templateId, meta, answers } = req.body;

  if (!name?.trim() || !rawInput?.trim()) {
    return res.status(400).json({ error: "name and rawInput are required" });
  }

  const modelKey = resolveModel(model);
  if (!modelKey) return res.status(400).json({ error: NO_PROVIDER });

  const template = getTemplate(templateId);

  // Answers to the clarifying questions are folded into the notes so every
  // section prompt sees them as stakeholder-provided fact, not a separate hint.
  const answered = (answers || []).filter((a) => a?.question && a?.answer?.trim());
  const effectiveInput = answered.length
    ? `${rawInput.trim()}\n\nAdditional details provided by the author:\n${answered
        .map((a) => `- ${a.question} ${a.answer.trim()}`)
        .join("\n")}`
    : rawInput.trim();

  res.setHeader("Content-Type", "application/x-ndjson");
  res.setHeader("Cache-Control", "no-cache");
  const send = (event) => res.write(JSON.stringify(event) + "\n");

  const sectionsContent = {};
  try {
    for (const section of template.sections) {
      send({ type: "progress", sectionId: section.id, sectionName: section.name, state: "working" });
      if (section.generated) {
        const prompt = buildSectionPrompt({ featureName: name.trim(), rawInput: effectiveInput, section, strictMode });
        sectionsContent[section.id] = await generate(prompt, modelKey);
      } else {
        sectionsContent[section.id] = section.seed;
      }
      send({ type: "progress", sectionId: section.id, sectionName: section.name, state: "done" });
    }

    const prd = store.create({
      name: name.trim(),
      rawInput: effectiveInput,
      status: status || "Draft",
      tags: tags || [],
      templateId: template.id,
      meta: meta || {},
      content: buildPrdContent(name.trim(), sectionsContent, template.sections),
    });

    send({ type: "complete", prd });
  } catch (err) {
    send({ type: "error", message: err.message || String(err) });
  } finally {
    res.end();
  }
});

// Preview only — does NOT persist. The caller (SectionCard) shows this next to
// the current content and only commits it via PATCH /api/prds/:id if the user
// clicks Accept, so a bad regenerate never destroys the previous version.
router.post("/:id/sections/:sectionId/regenerate", async (req, res) => {
  const prd = store.getById(req.params.id);
  if (!prd) return res.status(404).json({ error: "PRD not found" });

  const template = getTemplate(prd.templateId);
  const section = template.sections.find((s) => s.id === req.params.sectionId);
  if (!section) return res.status(404).json({ error: "Section not found" });

  const { feedback, previousContent, model } = req.body;
  if (!feedback?.trim()) return res.status(400).json({ error: "feedback is required" });

  const modelKey = resolveModel(model);
  if (!modelKey) return res.status(400).json({ error: NO_PROVIDER });

  try {
    const prompt = buildRegeneratePrompt({
      featureName: prd.name,
      section,
      previousContent: previousContent || "",
      feedback: feedback.trim(),
    });
    const sectionContent = await generate(prompt, modelKey);
    res.json({ sectionContent });
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

export default router;
