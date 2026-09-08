// Finds the "[NEEDS INPUT: ...]" markers Strict Mode writes instead of
// fabricating a number, so the UI can surface them instead of burying them in prose.

const GAP_RE = /\[NEEDS INPUT:\s*([^\]]+)\]/g;

export function findGaps(sectionsContent, sections) {
  const gaps = [];
  for (const section of sections) {
    const text = sectionsContent[section.id] || "";
    for (const match of text.matchAll(GAP_RE)) {
      gaps.push({ sectionId: section.id, sectionName: section.name, detail: match[1].trim() });
    }
  }
  return gaps;
}

export function countGaps(content) {
  if (!content) return 0;
  const matches = content.match(GAP_RE);
  return matches ? matches.length : 0;
}
