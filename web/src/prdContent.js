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

export function buildContent(name, sectionsContent, sections) {
  const lines = [`# PRD: ${name}`, "", "---", ""];
  for (const section of sections) {
    const content = sectionsContent[section.id];
    if (content) lines.push(`## ${section.name}`, "", content, "");
  }
  return lines.join("\n");
}
