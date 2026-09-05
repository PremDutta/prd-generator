// Flat-file JSON storage for PRDs. Simple on purpose: single-user, local product.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const PRDS_FILE = path.join(DATA_DIR, "prds.json");

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
    status: "Draft",
    tags: [],
    shareId: null,
    createdAt: now,
    updatedAt: now,
    ...prd,
  };
  prds.unshift(record);
  persist(prds);
  return record;
}

export function update(id, patch) {
  const prds = loadAll();
  const idx = prds.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  prds[idx] = { ...prds[idx], ...patch, id, updatedAt: new Date().toISOString() };
  persist(prds);
  return prds[idx];
}

export function remove(id) {
  const prds = loadAll().filter((p) => p.id !== id);
  persist(prds);
}
