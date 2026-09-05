import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, TextRun } from "docx";

function isTableSeparator(line) {
  return line.replace(/ /g, "").replace(/\|/g, "").replace(/-/g, "") === "";
}

function parseTableRow(line) {
  return line.split("|").slice(1, -1).map((c) => c.trim());
}

export function toMarkdown(prd) {
  return prd.content || "";
}

export function toHtml(prd) {
  const name = prd.name || "PRD";
  const lines = [];
  let inTable = false;
  let firstRow = false;

  for (const raw of (prd.content || "").split("\n")) {
    const line = raw.trim();

    if (line.startsWith("|")) {
      if (!inTable) {
        lines.push("<table style='border-collapse:collapse;width:100%;margin:15px 0;font-size:14px;'>");
        inTable = true;
        firstRow = true;
      }
      if (isTableSeparator(line)) continue;
      const cells = parseTableRow(line);
      const tag = firstRow ? "th" : "td";
      const style = firstRow
        ? "border:1px solid #ddd;padding:10px;background:#f5f5f5;text-align:left;"
        : "border:1px solid #ddd;padding:10px;";
      lines.push("<tr>" + cells.map((c) => `<${tag} style='${style}'>${c}</${tag}>`).join("") + "</tr>");
      firstRow = false;
      continue;
    } else if (inTable) {
      lines.push("</table>");
      inTable = false;
    }

    if (line.startsWith("### ")) lines.push(`<h3 style='color:#333;margin-top:25px;font-size:16px;'>${line.slice(4)}</h3>`);
    else if (line.startsWith("## ")) lines.push(`<h2 style='color:#1a56db;margin-top:35px;padding-bottom:10px;border-bottom:2px solid #1a56db;font-size:20px;'>${line.slice(3)}</h2>`);
    else if (line.startsWith("# ")) lines.push(`<h1 style='color:#111;font-size:28px;'>${line.slice(2)}</h1>`);
    else if (line.startsWith("- ")) lines.push(`<li style='margin:8px 0 8px 20px;'>${line.slice(2)}</li>`);
    else if (line === "---") lines.push("<hr style='margin:25px 0;border:none;border-top:1px solid #e5e7eb;'>");
    else if (line) lines.push(`<p style='margin:12px 0;line-height:1.7;'>${line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`);
  }
  if (inTable) lines.push("</table>");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${name}</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif;max-width:850px;margin:50px auto;padding:30px;line-height:1.6;color:#333;background:#fff;}
.meta{color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;padding-bottom:20px;margin-bottom:30px;}
</style>
</head>
<body>
<div class="meta">PRD Document &bull; Generated ${new Date().toISOString().slice(0, 10)}</div>
${lines.join("\n")}
</body>
</html>`;
}

export async function toDocx(prd) {
  const children = [
    new Paragraph({ text: prd.name || "PRD", heading: HeadingLevel.TITLE }),
    new Paragraph({ children: [new TextRun({ text: `Generated: ${new Date().toISOString().slice(0, 10)}`, italics: true })] }),
    new Paragraph({ text: "" }),
  ];

  let tableRows = [];
  const flushTable = () => {
    if (!tableRows.length) return;
    const rows = tableRows.map((cells, i) =>
      new TableRow({
        children: cells.map(
          (text) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text, bold: i === 0 })] })],
            })
        ),
      })
    );
    children.push(new Table({ rows }));
    children.push(new Paragraph({ text: "" }));
    tableRows = [];
  };

  let inTable = false;
  for (const raw of (prd.content || "").split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("|")) {
      inTable = true;
      if (isTableSeparator(line)) continue;
      tableRows.push(parseTableRow(line));
      continue;
    } else if (inTable) {
      flushTable();
      inTable = false;
    }

    if (line.startsWith("# ")) children.push(new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1 }));
    else if (line.startsWith("## ")) children.push(new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2 }));
    else if (line.startsWith("### ")) children.push(new Paragraph({ text: line.slice(4), heading: HeadingLevel.HEADING_3 }));
    else if (line.startsWith("- ")) children.push(new Paragraph({ text: line.slice(2), bullet: { level: 0 } }));
    else if (line === "---") continue;
    else {
      const parts = line.split(/(\*\*.+?\*\*)/);
      children.push(
        new Paragraph({
          children: parts
            .filter(Boolean)
            .map((part) =>
              part.startsWith("**") && part.endsWith("**")
                ? new TextRun({ text: part.slice(2, -2), bold: true })
                : new TextRun({ text: part })
            ),
        })
      );
    }
  }
  if (inTable) flushTable();

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}
