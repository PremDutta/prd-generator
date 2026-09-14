import { faangTemplate } from "./faang.js";
import { alignmentTemplate } from "./alignment.js";

export const TEMPLATES = {
  [faangTemplate.id]: faangTemplate,
  [alignmentTemplate.id]: alignmentTemplate,
};

export const DEFAULT_TEMPLATE_ID = faangTemplate.id;

export function getTemplate(templateId) {
  return TEMPLATES[templateId] || TEMPLATES[DEFAULT_TEMPLATE_ID];
}

export const DATA_INTEGRITY_STRICT = `DATA INTEGRITY RULE (do not break this):
If the stakeholder input below does not contain a specific number, date, or metric you need,
do NOT invent one. Write \`[NEEDS INPUT: <what's missing>]\` in its place and move on.
Never fabricate statistics, dollar amounts, percentages, or dates that were not given or
clearly implied by the input.`;

export const DATA_INTEGRITY_LOOSE = `DATA INTEGRITY RULE:
If the stakeholder input below does not contain a specific number, use a clearly-labeled
reasonable estimate, e.g. "(est.)", so the reader knows it wasn't provided.`;

export function buildSectionPrompt({ featureName, rawInput, section, strictMode }) {
  return `You are a Senior Product Manager at a top tech company (Google/Stripe/Airbnb level).

You're writing a PRD that will be reviewed by:
- Engineering leads (who need to estimate and build)
- Design leads (who need to understand the experience)
- Executive sponsors (who need to approve resources)

Your PRDs are known for:
- Crystal clarity (no ambiguity)
- Specific metrics (real numbers)
- Actionable requirements (engineers can start tomorrow)
- Honest risks (no surprises later)

${strictMode ? DATA_INTEGRITY_STRICT : DATA_INTEGRITY_LOOSE}

FEATURE CONTEXT:
===============
Feature Name: ${featureName}

Raw Input from Stakeholder:
${rawInput}

YOUR TASK:
==========
Write the "${section.name}" section of this PRD.

${section.prompt}

QUALITY BAR:
============
- Every sentence must add value (no filler)
- Be specific (numbers, names, dates) but only when the input supports it
- Be honest (include challenges, not just benefits)
- Be actionable (reader knows exactly what to do next)

Write ONLY the section content. No preamble, no "Here's the section", and do not
repeat "${section.name}" as a heading — the viewer already shows the section title.`;
}

// Asked before generation so the doc starts with real numbers instead of
// producing a pile of [NEEDS INPUT] markers the author has to backfill.
export function buildClarifyPrompt({ featureName, rawInput, sectionNames }) {
  return `You are a Senior Product Manager about to write a PRD titled "${featureName}".

Here are the stakeholder's raw notes:
---
${rawInput}
---

The PRD will contain these sections: ${sectionNames.join(", ")}.

Before writing, identify the 4-6 MOST important pieces of missing information —
the facts that, if you don't have them, would force you to leave a placeholder or
guess. Prioritise concrete, checkable facts: current baseline metrics, target
numbers, deadlines, affected user segments, known constraints.

Rules:
- Ask only about things the notes do NOT already answer.
- Each question must be answerable in one short line (a number, a date, a name).
- No open-ended essay questions ("what is your vision?"). Nothing generic.

Respond with ONLY a JSON array, no prose, no markdown fence:
[{"question": "What is the current weekly conversion rate?", "why": "Needed for the success-metrics baseline"}]`;
}

// Models sometimes wrap JSON in prose or a ```json fence despite instructions,
// so pull out the first array rather than trusting the whole response to parse.
export function parseClarifyResponse(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return [];
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((q) => q && typeof q.question === "string" && q.question.trim())
      .slice(0, 6)
      .map((q, i) => ({ id: `q${i}`, question: q.question.trim(), why: typeof q.why === "string" ? q.why.trim() : "" }));
  } catch {
    return [];
  }
}

export function buildRegeneratePrompt({ featureName, section, previousContent, feedback }) {
  return `You previously wrote the "${section.name}" section of a PRD for "${featureName}":

---
${previousContent}
---

The author wants this specific change applied: "${feedback}"

Rewrite the section incorporating that feedback. Keep the same structure/format
conventions (headings, tables, lists) as the original. Output ONLY the revised
section content, no preamble.`;
}

export function buildPrdContent(name, sectionsContent, sections) {
  const lines = [`# PRD: ${name}`, "", "---", ""];
  for (const section of sections) {
    const content = sectionsContent[section.id];
    if (content) {
      lines.push(`## ${section.name}`, "", content, "");
    }
  }
  return lines.join("\n");
}

export function parseSectionsFromContent(content, sections) {
  const parsed = {};
  for (const section of sections) {
    const marker = `## ${section.name}`;
    const start = content.indexOf(marker);
    if (start === -1) continue;
    const from = start + marker.length;
    let end = content.length;
    for (const next of sections) {
      const nextMarker = `## ${next.name}`;
      const idx = content.indexOf(nextMarker, from);
      if (idx !== -1 && idx < end) end = idx;
    }
    parsed[section.id] = content.slice(from, end).trim();
  }
  return parsed;
}
