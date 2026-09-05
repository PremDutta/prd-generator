import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";

import * as store from "./storage.js";
import { generate, MODELS } from "./groqClient.js";
import {
  SECTIONS,
  buildSectionPrompt,
  buildRegeneratePrompt,
  buildPrdContent,
  parseSectionsFromContent,
} from "./sections.js";
import { toMarkdown, toHtml, toDocx } from "./exporters.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIST = path.join(__dirname, "..", "..", "web", "dist");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 8787;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

app.get("/api/config", (_req, res) => {
  res.json({ models: MODELS, sections: SECTIONS.map(({ id, name, icon }) => ({ id, name, icon })), apiKeyConfigured: !!process.env.GROQ_API_KEY });
});

// ---------------------------------------------------------------------------
// PRD list / CRUD
// ---------------------------------------------------------------------------

app.get("/api/prds", (req, res) => {
  const { search, status } = req.query;
  let prds = store.loadAll();
  if (search) {
    const s = String(search).toLowerCase();
    prds = prds.filter(
      (p) => p.name?.toLowerCase().includes(s) || (p.tags || []).some((t) => t.toLowerCase().includes(s))
    );
  }
  if (status) prds = prds.filter((p) => p.status === status);
  res.json(prds);
});

app.get("/api/prds/:id", (req, res) => {
  const prd = store.getById(req.params.id);
  if (!prd) return res.status(404).json({ error: "PRD not found" });
  res.json(prd);
});

app.patch("/api/prds/:id", (req, res) => {
  const updated = store.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "PRD not found" });
  res.json(updated);
});

app.post("/api/prds/:id/duplicate", (req, res) => {
  const prd = store.getById(req.params.id);
  if (!prd) return res.status(404).json({ error: "PRD not found" });
  const copy = store.create({
    name: `${prd.name} (copy)`,
    rawInput: prd.rawInput,
    content: prd.content,
    status: "Draft",
    tags: prd.tags,
  });
  res.json(copy);
});

app.delete("/api/prds/:id", (req, res) => {
  store.remove(req.params.id);
  res.status(204).end();
});

// ---------------------------------------------------------------------------
// Generation (streamed as newline-delimited JSON so the UI can show live progress)
// ---------------------------------------------------------------------------

app.post("/api/prds/generate", async (req, res) => {
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
      const content = await generate(prompt, model || Object.keys(MODELS)[0]);
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

app.post("/api/prds/:id/sections/:sectionId/regenerate", async (req, res) => {
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
    const newContent = await generate(prompt, model || Object.keys(MODELS)[0]);

    const sectionsContent = parseSectionsFromContent(prd.content || "");
    sectionsContent[section.id] = newContent;
    const updated = store.update(prd.id, { content: buildPrdContent(prd.name, sectionsContent) });

    res.json({ sectionContent: newContent, prd: updated });
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

app.get("/api/prds/:id/export/:format", async (req, res) => {
  const prd = store.getById(req.params.id);
  if (!prd) return res.status(404).json({ error: "PRD not found" });

  const filename = (prd.name || "prd").replace(/[^a-z0-9-_]+/gi, "_");

  if (req.params.format === "markdown") {
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.md"`);
    res.type("text/markdown").send(toMarkdown(prd));
  } else if (req.params.format === "html") {
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.html"`);
    res.type("text/html").send(toHtml(prd));
  } else if (req.params.format === "docx") {
    const buffer = await toDocx(prd);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.docx"`);
    res.type("application/vnd.openxmlformats-officedocument.wordprocessingml.document").send(buffer);
  } else {
    res.status(400).json({ error: "Unknown export format" });
  }
});

// ---------------------------------------------------------------------------
// Sharing (real links backed by the server, not a base64 URL hack)
// ---------------------------------------------------------------------------

app.post("/api/prds/:id/share", (req, res) => {
  const prd = store.getById(req.params.id);
  if (!prd) return res.status(404).json({ error: "PRD not found" });
  const shareId = prd.shareId || nanoid(12);
  const updated = store.update(prd.id, { shareId });
  res.json({ shareId: updated.shareId });
});

app.get("/api/shared/:shareId", (req, res) => {
  const prd = store.getByShareId(req.params.shareId);
  if (!prd) return res.status(404).json({ error: "Shared PRD not found" });
  res.json({ name: prd.name, content: prd.content });
});

app.post("/api/shared/:shareId/import", (req, res) => {
  const prd = store.getByShareId(req.params.shareId);
  if (!prd) return res.status(404).json({ error: "Shared PRD not found" });
  const imported = store.create({
    name: `${prd.name} (imported)`,
    rawInput: prd.rawInput || "",
    content: prd.content,
    status: "Draft",
    tags: [],
  });
  res.json(imported);
});

// ---------------------------------------------------------------------------
// Serve the built frontend (web/dist) so the whole app is one deployable
// service with one URL. Local dev instead runs the Vite dev server separately
// and proxies /api to this server, so this block is a no-op until you build.
// ---------------------------------------------------------------------------

if (fs.existsSync(WEB_DIST)) {
  app.use(express.static(WEB_DIST));
  app.get("*", (req, res) => {
    res.sendFile(path.join(WEB_DIST, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`PRD Generator API listening on http://localhost:${PORT}`);
});
