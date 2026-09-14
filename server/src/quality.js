// PRD quality scoring.
//
// Deliberately deterministic rather than an AI call: these checks are structural
// ("is there a number in the metrics section?"), so running them in-process is
// instant, free, and can't hallucinate a passing grade on a doc that's missing
// half its substance.

import { parseSectionsFromContent } from "./templates/index.js";

const GAP_RE = /\[NEEDS INPUT:\s*[^\]]+\]/g;

function findSection(sections, sectionsContent, ...keywords) {
  const match = sections.find((s) => keywords.some((k) => s.id.includes(k) || s.name.toLowerCase().includes(k)));
  return match ? { section: match, text: sectionsContent[match.id] || "" } : null;
}

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

const THIN_SECTION_WORDS = 40;

export function scorePrd(prd, template) {
  const sections = template.sections;
  const sectionsContent = parseSectionsFromContent(prd.content || "", sections);
  const allText = prd.content || "";
  const checks = [];

  // Weighted: unanswered gaps count for more than any single structural check,
  // since a doc full of placeholders isn't safe to act on no matter how neatly
  // the rest of it is laid out. `credit` allows partial marks so that closing
  // some of a long gap list visibly moves the score instead of showing no
  // progress until the very last one is filled.
  const add = (id, label, passed, detail, sectionId = null, weight = 1, credit = null) =>
    checks.push({ id, label, passed, detail, sectionId, weight, credit: credit ?? (passed ? 1 : 0) });

  // 1. Outstanding gaps — the headline check, since unfilled gaps are the one
  // thing that makes a PRD unsafe to act on.
  const gapCount = (allText.match(GAP_RE) || []).length;
  add(
    "gaps",
    "No unanswered gaps",
    gapCount === 0,
    gapCount === 0 ? "Every placeholder has been filled in." : `${gapCount} [NEEDS INPUT] marker${gapCount > 1 ? "s" : ""} still unanswered.`,
    null,
    3,
    gapCount === 0 ? 1 : gapCount <= 3 ? 0.6 : gapCount <= 8 ? 0.35 : gapCount <= 15 ? 0.15 : 0
  );

  // 2. Metrics are actually quantified.
  const goals = findSection(sections, sectionsContent, "goal", "metric", "success");
  if (goals) {
    const hasNumber = /\d/.test(goals.text.replace(GAP_RE, ""));
    add(
      "quantified",
      "Success metrics are quantified",
      hasNumber,
      hasNumber ? "Contains concrete numbers." : "No real numbers found — targets can't be measured.",
      goals.section.id
    );
  }

  // 3. Non-goals / out of scope stated.
  const hasNonGoals = /non-?goals?|out of scope|not (?:building|doing)/i.test(allText);
  add(
    "nongoals",
    "Non-goals are explicit",
    hasNonGoals,
    hasNonGoals ? "Scope boundaries are stated." : "Nothing marked out of scope — invites scope creep."
  );

  // 4. Acceptance criteria for engineers.
  const hasAcceptance = /acceptance criteri|definition of done|how to verify/i.test(allText);
  add(
    "acceptance",
    "Acceptance criteria present",
    hasAcceptance,
    hasAcceptance ? "Requirements say how to verify done." : "No acceptance criteria — engineers will need to ask."
  );

  // 5. Risks paired with mitigations.
  const risks = findSection(sections, sectionsContent, "risk");
  if (risks) {
    const hasMitigation = /mitigat/i.test(risks.text);
    add(
      "mitigations",
      "Risks have mitigations",
      hasMitigation,
      hasMitigation ? "Risks name what to do about them." : "Risks listed without mitigations.",
      risks.section.id
    );
  }

  // 6. Timeline / dates.
  const hasTimeline = /week \d|q[1-4]\b|\d{4}-\d{2}-\d{2}|month \d|sprint/i.test(allText);
  add(
    "timeline",
    "Timeline is concrete",
    hasTimeline,
    hasTimeline ? "Milestones are dated." : "No dates or milestones found."
  );

  // 7. No thin sections.
  const thin = sections
    .filter((s) => s.generated !== false)
    .filter((s) => {
      const text = sectionsContent[s.id];
      return text !== undefined && wordCount(text) < THIN_SECTION_WORDS;
    });
  add(
    "depth",
    "No thin sections",
    thin.length === 0,
    thin.length === 0
      ? "Every section has real substance."
      : `Under ${THIN_SECTION_WORDS} words: ${thin.map((s) => s.name).join(", ")}.`,
    thin[0]?.id || null
  );

  const passed = checks.filter((c) => c.passed).length;
  const earned = checks.reduce((sum, c) => sum + c.credit * c.weight, 0);
  const possible = checks.reduce((sum, c) => sum + c.weight, 0);
  const score = Math.round((earned / possible) * 100);
  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";

  return { score, grade, passed, total: checks.length, checks };
}
