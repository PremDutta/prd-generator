// PRD section definitions and prompt templates.

export const SECTIONS = [
  {
    id: "overview",
    name: "Overview",
    icon: "🧭",
    prompt: `Write a crisp Overview section (3-4 sentences max).

Include:
- One sentence: What we're building
- One sentence: Why now (urgency/opportunity)
- One sentence: Expected business impact

Be specific. No fluff. Every word should matter.`,
  },
  {
    id: "problem",
    name: "Problem Statement",
    icon: "🚨",
    prompt: `Write a compelling Problem Statement.

Structure:
1. **The Problem** (2-3 sentences): What's broken? Be specific.
2. **Who's Affected**: Which users/segments experience this?
3. **Current Workarounds**: How do users solve this today?
4. **Cost of Inaction**: What happens if we don't solve this?

Bad: "Users find it hard to export data"
Good: "Enterprise users (45% of revenue) cannot export to Excel, causing 3+ support tickets/week and blocking 2 active deals worth $50K ARR"`,
  },
  {
    id: "goals",
    name: "Goals & Success Metrics",
    icon: "🎯",
    prompt: `Write Goals & Success Metrics that an executive would approve.

Structure:
**Primary Goal**: One sentence, measurable

**Success Metrics** (table format):
| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Example: Support tickets for exports | 12/week | <3/week | 30 days post-launch |

**Non-Goals** (equally important):
- What we're explicitly NOT trying to achieve
- What's out of scope for this iteration

Avoid vanity metrics.
Bad: "Improve user satisfaction"
Good: "Reduce export-related support tickets from 12/week to <3/week within 30 days"`,
  },
  {
    id: "users",
    name: "User Stories & Personas",
    icon: "👥",
    prompt: `Write User Stories that engineers can build from.

**Primary Persona**:
Name, role, context (1-2 sentences)

**User Stories** (use this exact format):
1. As a [specific user], I want to [specific action], so that [specific outcome].
   - Acceptance criteria: [How we know it's done]

2. As a [specific user], I want to [specific action], so that [specific outcome].
   - Acceptance criteria: [How we know it's done]

Include 3-5 user stories covering the main use cases.

Bad: "As a user, I want to export data"
Good: "As a finance analyst, I want to export quarterly data to Excel with formulas preserved, so that I can run my existing pivot table reports without manual reformatting. Acceptance: Excel file opens with formulas working, <30 sec for 100K rows"`,
  },
  {
    id: "solution",
    name: "Proposed Solution",
    icon: "💡",
    prompt: `Write the Proposed Solution section.

Structure:
**Solution Summary**: 2-3 sentences describing the approach

**Key Capabilities**:
1. [Capability 1]: Brief description
2. [Capability 2]: Brief description
3. [Capability 3]: Brief description

**Why This Approach**:
- Alternative considered: [X] — Why rejected: [reason]
- Alternative considered: [Y] — Why rejected: [reason]
- Chosen approach: [Z] — Why: [compelling reason]

**Technical Approach** (high-level):
Brief description of how this will be built (1-2 sentences)

Be specific about what we're building, not vague aspirations.`,
  },
  {
    id: "requirements",
    name: "Functional Requirements",
    icon: "✅",
    prompt: `Write Functional Requirements that an engineer can build from tomorrow.

**P0 - Must Have** (launch blockers):
| ID | Requirement | Details | Acceptance Criteria |
|----|-------------|---------|---------------------|
| R1 | [Requirement] | [Specifics] | [How to verify] |

**P1 - Should Have** (fast follow):
| ID | Requirement | Details | Acceptance Criteria |
|----|-------------|---------|---------------------|

**P2 - Nice to Have** (future):
| ID | Requirement | Details | Acceptance Criteria |
|----|-------------|---------|---------------------|

Be extremely specific. Engineers should not need to ask clarifying questions.
Bad: "Support large files"
Good: "Support files up to 1M rows, export completes in <60 seconds, progress indicator shown"`,
  },
  {
    id: "scope",
    name: "Scope & Timeline",
    icon: "🗓️",
    prompt: `Write Scope & Timeline section.

**In Scope** (what we WILL build):
- [Specific deliverable 1]
- [Specific deliverable 2]
- [Specific deliverable 3]

**Out of Scope** (what we will NOT build):
- [Explicit exclusion 1] — Why: [reason]
- [Explicit exclusion 2] — Why: [reason]

**Dependencies**:
- [Team/System]: [What we need from them]

**Timeline**:
| Milestone | Date | Owner |
|-----------|------|-------|
| Design complete | Week 1 | Design |
| Backend API ready | Week 2 | Backend |
| Frontend complete | Week 3 | Frontend |
| QA & Bug fixes | Week 4 | QA |
| Launch | Week 5 | PM |

Be explicit about what's NOT included. This prevents scope creep.`,
  },
  {
    id: "risks",
    name: "Risks & Mitigations",
    icon: "⚠️",
    prompt: `Write Risks & Mitigations like a senior PM who's shipped before.

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Specific risk] | High/Med/Low | High/Med/Low | [Specific action to reduce risk] |

Include:
- Technical risks (performance, scale, integration)
- Business risks (adoption, competition, timing)
- Resource risks (dependencies, availability)

Be honest about what could go wrong. Leadership respects realism.
Bad: "There might be technical challenges"
Good: "Export >500K rows may timeout on current infrastructure. Mitigation: Implement async processing with email notification, already validated approach with Platform team"`,
  },
];

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

Write ONLY the section content. No preamble, no "Here's the section", just the content.`;
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

export function buildPrdContent(name, sectionsContent) {
  const lines = [`# PRD: ${name}`, "", "---", ""];
  for (const section of SECTIONS) {
    const content = sectionsContent[section.id];
    if (content) {
      lines.push(`## ${section.name}`, "", content, "");
    }
  }
  return lines.join("\n");
}

export function parseSectionsFromContent(content) {
  const parsed = {};
  for (const section of SECTIONS) {
    const marker = `## ${section.name}`;
    const start = content.indexOf(marker);
    if (start === -1) continue;
    const from = start + marker.length;
    let end = content.length;
    for (const next of SECTIONS) {
      const nextMarker = `## ${next.name}`;
      const idx = content.indexOf(nextMarker, from);
      if (idx !== -1 && idx < end) end = idx;
    }
    parsed[section.id] = content.slice(from, end).trim();
  }
  return parsed;
}
