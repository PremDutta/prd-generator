import { Router } from "express";
import * as store from "../storage.js";

const router = Router();

router.get("/", (req, res) => {
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

router.get("/:id", (req, res) => {
  const prd = store.getById(req.params.id);
  if (!prd) return res.status(404).json({ error: "PRD not found" });
  res.json(prd);
});

router.patch("/:id", (req, res) => {
  const updated = store.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "PRD not found" });
  res.json(updated);
});

router.post("/:id/duplicate", (req, res) => {
  const prd = store.getById(req.params.id);
  if (!prd) return res.status(404).json({ error: "PRD not found" });
  const copy = store.create({
    name: `${prd.name} (copy)`,
    rawInput: prd.rawInput,
    content: prd.content,
    status: "Draft",
    tags: prd.tags,
    templateId: prd.templateId,
    meta: prd.meta,
  });
  res.json(copy);
});

router.delete("/:id", (req, res) => {
  store.remove(req.params.id);
  res.status(204).end();
});

export default router;
