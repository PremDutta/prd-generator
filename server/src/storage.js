// Flat-file JSON storage for PRDs. Simple on purpose: single-user, local product.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";
import { getTemplate, DEFAULT_TEMPLATE_ID, parseSectionsFromContent, buildPrdContent } from "./templates/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const PRDS_FILE = path.join(DATA_DIR, "prds.json");

const HISTORY_LIMIT = 10;

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PRDS_FILE)) fs.writeFileSync(PRDS_FILE, "[]");
}

export function loadAll() {
  ensureStore();
  try {
    const raw = fs.readFileSync(PRDS_FILE, "utf-8");
    return raw.trim() ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(prds) {
  ensureStore();
  fs.writeFileSync(PRDS_FILE, JSON.stringify(prds, null, 2));
}

export function getById(id) {
  return loadAll().find((p) => p.id === id) || null;
}

export function getByShareId(shareId) {
  return loadAll().find((p) => p.shareId === shareId) || null;
}

export function create(prd) {
  const prds = loadAll();
  const now = new Date().toISOString();
  const record = {
    id: nanoid(10),
    templateId: DEFAULT_TEMPLATE_ID,
    status: "Draft",
    tags: [],
    meta: {},
    history: {},
    shareId: null,
    createdAt: now,
    updatedAt: now,
    ...prd,
  };
  prds.unshift(record);
  persist(prds);
  return record;
}

// Diffs old vs new content per-section so:
// - a changed section's previous text is pushed onto its undo history, and
// - the Changelog table (alignment template) gets an automatic entry.
// This runs centrally here so every write path (manual edit, accepted AI
// regenerate) gets history/changelog for free without each route re-implementing it.
function withHistoryAndChangelog(old, patch) {
  if (!patch.content || patch.content === old.content || !old.content) return patch;

  const template = getTemplate(old.templateId);
  const oldSections = parseSectionsFromContent(old.content, template.sections);
  const newSections = parseSectionsFromContent(patch.content, template.sections);
  const history = { ...(old.history || {}) };
  const changedSectionNames = [];

  for (const section of template.sections) {
    const oldText = oldSections[section.id] || "";
    const newText = newSections[section.id] || "";
    if (oldText && oldText !== newText) {
      const list = (history[section.id] || []).slice();
      list.push({ content: oldText, savedAt: new Date().toISOString() });
      history[section.id] = list.slice(-HISTORY_LIMIT);
      if (section.id !== "changelog") changedSectionNames.push(section.name);
    }
  }

  const patched = { ...patch, history };

  const hasChangelog = template.sections.some((s) => s.id === "changelog");
  if (hasChangelog && changedSectionNames.length) {
    const existing = newSections.changelog || "| Date | Description |\n|---|---|";
    const row = `| ${new Date().toISOString().slice(0, 10)} | Updated ${changedSectionNames.join(", ")} |`;
    newSections.changelog = `${existing}\n${row}`;
    patched.content = buildPrdContent(old.name, newSections, template.sections);
  }

  return patched;
}

export function update(id, patch) {
  const prds = loadAll();
  const idx = prds.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const old = prds[idx];
  const finalPatch = withHistoryAndChangelog(old, patch);
  prds[idx] = { ...old, ...finalPatch, id, updatedAt: new Date().toISOString() };
  persist(prds);
  return prds[idx];
}

export function remove(id) {
  const prds = loadAll().filter((p) => p.id !== id);
  persist(prds);
}
