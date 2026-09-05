import { Router } from "express";
import * as store from "../storage.js";
import { toMarkdown, toHtml, toDocx } from "../exporters.js";

const router = Router();

router.get("/:id/export/:format", async (req, res) => {
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

export default router;
