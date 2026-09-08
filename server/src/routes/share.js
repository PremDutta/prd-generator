import { Router } from "express";
import { nanoid } from "nanoid";
import * as store from "../storage.js";

const prdsRouter = Router();
const sharedRouter = Router();

// Mounted at /api/prds — generates (or returns the existing) share link for a PRD.
prdsRouter.post("/:id/share", (req, res) => {
  const prd = store.getById(req.params.id);
  if (!prd) return res.status(404).json({ error: "PRD not found" });
  const shareId = prd.shareId || nanoid(12);
  const updated = store.update(prd.id, { shareId });
  res.json({ shareId: updated.shareId });
});

// Mounted at /api/shared — public, read-only access via a share link.
sharedRouter.get("/:shareId", (req, res) => {
  const prd = store.getByShareId(req.params.shareId);
  if (!prd) return res.status(404).json({ error: "Shared PRD not found" });
  res.json({ name: prd.name, content: prd.content, templateId: prd.templateId, meta: prd.meta });
});

sharedRouter.post("/:shareId/import", (req, res) => {
  const prd = store.getByShareId(req.params.shareId);
  if (!prd) return res.status(404).json({ error: "Shared PRD not found" });
  const imported = store.create({
    name: `${prd.name} (imported)`,
    rawInput: prd.rawInput || "",
    content: prd.content,
    status: "Draft",
    tags: [],
    templateId: prd.templateId,
    meta: prd.meta,
  });
  res.json(imported);
});

export { prdsRouter, sharedRouter };
