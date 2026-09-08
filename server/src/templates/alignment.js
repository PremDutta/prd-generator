// The "Figma-style" alignment-doc template — mirrors the classic
// Problem/Solution-alignment PRD format: narrower generated prose sections,
// plus hand-filled tracking tables (sign-off, ops checklist, changelog,
// open questions, impact checklist) that read/write as plain markdown so
// they get full history/undo and export support for free.

const today = () => new Date().toISOString().slice(0, 10);

export const alignmentTemplate = {
  id: "alignment",
  name: "Alignment Doc (Figma-style)",
  description: "Problem/Solution alignment format with reviewer sign-off and a launch checklist.",
  sections: [
    {
      id: "problemAlignment",
      name: "Problem Alignment",
      icon: "🧩",
      generated: true,
      prompt: `Write the Problem Alignment section.

Describe the problem in 1-2 sentences — someone should be able to read just this and
explain the value/risk to someone else. Then answer:
- Why does this matter to customers and the business?
- What evidence or insights support this?

${""}`,
    },
    {
      id: "highLevelApproach",
      name: "High Level Approach",
      icon: "🗺️",
      generated: true,
      prompt: `Write the High Level Approach section (2-4 sentences).

Describe the rough shape of how we might tackle the problem — specific enough that
someone could squint and see the same shape, but without full solution detail yet.
Example: if the problem is "discoverability of new features," the approach might be
"a notification center for relevant features."`,
    },
    {
      id: "narrative",
      name: "Narrative (optional)",
      icon: "📖",
      generated: true,
      prompt: `Write an optional Narrative section: 1-2 short (hypothetical) customer stories
that paint a picture of what life looks like today, including a common case and an
edge case worth designing for. Keep it to a short paragraph or two — this sets scene,
it doesn't replace the requirements.`,
    },
    {
      id: "goals",
      name: "Goals",
      icon: "🎯",
      generated: true,
      prompt: `List high-level Goals, in priority order, not too many.

Include both measurable (metrics) and immeasurable (how it should feel) goals.
Keep it short.`,
    },
    {
      id: "nonGoals",
      name: "Non-goals",
      icon: "🚫",
      generated: true,
      prompt: `List explicit Non-goals — areas we do not plan to address in this project — and
why each is out of scope. These are as important as the goals themselves for setting
expectations.`,
    },
    {
      id: "problemSignOff",
      name: "Problem Alignment Sign-off",
      icon: "✅",
      generated: false,
      seed: `Do not move to Solution Alignment until every contributor below is aligned on the problem.

| Reviewer | Team / Role | Status |
|---|---|---|
| | | Pending |
| | | Pending |`,
    },
    {
      id: "keyFeatures",
      name: "Key Features",
      icon: "🧱",
      generated: true,
      prompt: `Write the Key Features section — the "plan of record" that draws the perimeter of
the solution space (not implementation detail).

**Plan of Record** (priority order):
1. [Feature] — one line on what it does and why it's in scope

**Future Considerations** (optional):
- Features intentionally saved for later, and how they inform what's being built now.

Draw the boundary so the team knows what's in vs. out — don't force the reader to
guess the scope.`,
    },
    {
      id: "keyFlows",
      name: "Key Flows",
      icon: "🔀",
      generated: true,
      prompt: `Write the Key Flows section: the end-to-end experience for the customer, as a
numbered step-by-step walkthrough (since this tool can't produce diagrams or
screenshots — note in one line that a diagram/Figma link should be added here once
design has one, using the Resources field at the top of this doc).

Cover the primary flow and at least one edge case.`,
    },
    {
      id: "keyLogic",
      name: "Key Logic",
      icon: "🧠",
      generated: true,
      prompt: `Write the Key Logic section: the rules that guide design and development.

- List rules as bullets, addressing common scenarios and edge cases.
- Prefer writing these out explicitly rather than leaving them to be inferred from
  designs — it's easier to align on a rule in text than to reverse-engineer it from a
  mockup.`,
    },
    {
      id: "solutionSignOff",
      name: "Solution Alignment Sign-off",
      icon: "✅",
      generated: false,
      seed: `Do not move to Launch Plan until every contributor below is aligned on the solution.

| Reviewer | Team / Role | Status |
|---|---|---|
| | | Pending |
| | | Pending |`,
    },
    {
      id: "launchPlan",
      name: "Launch Plan",
      icon: "🚀",
      generated: true,
      prompt: `Write the Launch Plan section: the phases that get this to market, and what must
be true to move from one phase to the next. Call out risks/dependencies that could
disrupt the timeline, with a contingency where possible.

**Key Milestones**:
| Target Date | Milestone | Description | Exit Criteria |
|---|---|---|---|
| [NEEDS INPUT: date] | Pilot | Internal testing with employees only | No P0/P1 bugs on a rolling 7-day basis |
| [NEEDS INPUT: date] | Beta | Early cohort of customers | [specific bar, e.g. "N customers would be disappointed if we took it away"] |
| [NEEDS INPUT: date] | Launch | All customers in current markets | Measure and monitor |

Adjust the phases/rows to fit this specific project rather than copying the example
verbatim.`,
    },
    {
      id: "operationalChecklist",
      name: "Operational Checklist",
      icon: "📋",
      generated: false,
      seed: `Cross-functional launch checklist. Fill in Y/N and the action owner for anything relevant.

| Team | Prompt | Y/N | Action (if yes) |
|---|---|---|---|
| Analytics | Do you need additional tracking? | | |
| Sales | Do you need sales enablement materials? | | |
| Marketing | Does this impact a shared KPI? | | |
| Customer Success | Do you need to update support content or training? | | |
| Product Marketing | Do you need a GTM plan (pricing, packaging, positioning)? | | |
| Partners | Will this impact any external partners? | | |
| Globalization | Are you launching in multiple countries? | | |
| Risk | Does this expose a risk vector? | | |
| Legal | Are there potential legal ramifications? | | |`,
    },
    {
      id: "faq",
      name: "FAQ",
      icon: "❓",
      generated: true,
      prompt: `Write an optional FAQ: 3-5 questions a stakeholder would plausibly ask when
skimming this doc for the first time, with short direct answers. Skip this section
content (write "None yet.") if the input doesn't give you enough to answer honestly
instead of inventing questions/answers with no basis.`,
    },
    {
      id: "openQuestions",
      name: "Open Questions",
      icon: "❔",
      generated: false,
      seed: `Track open questions and answers here as they come up.

| Question | Answer | Status |
|---|---|---|
| | | Open |`,
    },
    {
      id: "impactChecklist",
      name: "Impact Checklist",
      icon: "🔍",
      generated: false,
      seed: `- [ ] Permissions
- [ ] Reporting
- [ ] Pricing
- [ ] API
- [ ] Global`,
    },
    {
      id: "changelog",
      name: "Changelog",
      icon: "🕓",
      generated: false,
      seed: `| Date | Description |
|---|---|
| ${today()} | PRD created |`,
    },
  ],
};
