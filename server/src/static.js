// Serves the built frontend (web/dist) so the whole app is one deployable
// service with one URL. In local dev the Vite dev server runs separately and
// proxies /api here instead, so this is a no-op until you build the frontend.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIST = path.join(__dirname, "..", "..", "web", "dist");

export function serveFrontend(app) {
  if (!fs.existsSync(WEB_DIST)) return;
  app.use(express.static(WEB_DIST));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(WEB_DIST, "index.html"));
  });
}
