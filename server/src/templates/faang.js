// The original 8-section "FAANG-style" PRD template.

export const faangTemplate = {
  id: "faang",
  name: "FAANG-style PRD",
  description: "Metrics-driven doc for exec/eng review — Overview through Risks.",
  sections: [
    {
      id: "overview",
      name: "Overview",
      icon: "🧭",
      generated: true,
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
      generated: true,
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
      generated: true,
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
      generated: true,
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
      generated: true,
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
      generated: true,
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
      generated: true,
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
      generated: true,
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
  ],
};
