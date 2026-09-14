// Section-level review comments.
//
// Two entry points share the same storage: the owner comments via /api/prds/:id,
// and anyone holding a share link comments via /api/shared/:shareId — that's what
// turns a share link from a read-only broadcast into an actual review loop.

import { Router } from "express";
import { nanoid } from "nanoid";
import * as store from "../storage.js";

const prdsRouter = Router();
const sharedRouter = Router();

function addComment(prd, { sectionId, author, body }) {
  const comments = { ...(prd.comments || {}) };
  const list = (comments[sectionId] || []).slice();
  list.push({
    id: nanoid(8),
    author: (author || "Anonymous").trim().slice(0, 60),
    body: body.trim().slice(0, 2000),
    resolved: false,
    createdAt: new Date().toISOString(),
  });
  comments[sectionId] = list;
  return store.update(prd.id, { comments });
}

function validate(req, res) {
  const { sectionId, body } = req.body;
  if (!sectionId || !body?.trim()) {
    res.status(400).json({ error: "sectionId and body are required" });
    return false;
  }
  return true;
}

// The public endpoint takes writes from anyone holding a link, so it gets a
// simple in-process throttle. Not a substitute for auth — it just stops a
// shared link being trivially flooded. Resets on restart, which is fine for a
// single-instance app.
const RATE_LIMIT = { max: 10, windowMs: 60_000 };
const hits = new Map();

function rateLimited(key) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) {
    for (const [k, times] of hits) {
      if (!times.some((t) => now - t < RATE_LIMIT.windowMs)) hits.delete(k);
    }
  }
  return false;
}

prdsRouter.post("/:id/comments", (req, res) => {
  const prd = store.getById(req.params.id);
  if (!prd) return res.status(404).json({ error: "PRD not found" });
  if (!validate(req, res)) return;
  const updated = addComment(prd, req.body);
  res.json({ comments: updated.comments });
});

prdsRouter.patch("/:id/comments/:commentId", (req, res) => {
  const prd = store.getById(req.params.id);
  if (!prd) return res.status(404).json({ error: "PRD not found" });

  const comments = { ...(prd.comments || {}) };
  let found = false;
  for (const [sectionId, list] of Object.entries(comments)) {
    comments[sectionId] = list.map((c) => {
      if (c.id !== req.params.commentId) return c;
      found = true;
      return { ...c, resolved: req.body.resolved ?? !c.resolved };
    });
  }
  if (!found) return res.status(404).json({ error: "Comment not found" });

  const updated = store.update(prd.id, { comments });
  res.json({ comments: updated.comments });
});

prdsRouter.delete("/:id/comments/:commentId", (req, res) => {
  const prd = store.getById(req.params.id);
  if (!prd) return res.status(404).json({ error: "PRD not found" });

  const comments = {};
  for (const [sectionId, list] of Object.entries(prd.comments || {})) {
    const kept = list.filter((c) => c.id !== req.params.commentId);
    if (kept.length) comments[sectionId] = kept;
  }
  const updated = store.update(prd.id, { comments });
  res.json({ comments: updated.comments });
});

// Public: a reviewer with the link can comment without an account. The owner
// can switch this off per PRD if a link travels further than intended.
sharedRouter.post("/:shareId/comments", (req, res) => {
  const prd = store.getByShareId(req.params.shareId);
  if (!prd) return res.status(404).json({ error: "Shared PRD not found" });
  if (prd.commentsEnabled === false) {
    return res.status(403).json({ error: "Comments are turned off for this link." });
  }
  if (rateLimited(`${req.ip}:${req.params.shareId}`)) {
    return res.status(429).json({ error: "Too many comments in a short time. Wait a minute and try again." });
  }
  if (!validate(req, res)) return;
  const updated = addComment(prd, req.body);
  res.json({ comments: updated.comments });
});

export { prdsRouter, sharedRouter };
