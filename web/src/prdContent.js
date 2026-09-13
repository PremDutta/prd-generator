// Mirrors server/src/sections.js's markdown parsing so section edits can be
// reassembled into the full PRD content without another round trip.

export function parseSections(content, sections) {
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

// Drops the leading "# PRD: <name>" title (and the rule under it) so a view
// that already shows the title in its own heading doesn't render it twice.
export function stripDocTitle(content) {
  return (content || "").replace(/^\s*#\s+.*\n+(---\s*\n+)?/, "");
}

export function buildContent(name, sectionsContent, sections) {
  const lines = [`# PRD: ${name}`, "", "---", ""];
  for (const section of sections) {
    const content = sectionsContent[section.id];
    if (content) lines.push(`## ${section.name}`, "", content, "");
  }
  return lines.join("\n");
}
