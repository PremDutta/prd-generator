import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, TextRun } from "docx";
import puppeteer from "puppeteer";

function isTableSeparator(line) {
  return line.replace(/ /g, "").replace(/\|/g, "").replace(/-/g, "") === "";
}

function parseTableRow(line) {
  return line.split("|").slice(1, -1).map((c) => c.trim());
}

// Renders **bold**, and highlights Strict Mode's "[NEEDS INPUT: ...]" markers
// the same way the app does, so an exported doc reads as having deliberate open
// questions rather than leftover placeholder text.
function inlineHtml(text) {
  return text
    .replace(
      /\[NEEDS INPUT:\s*([^\]]+)\]/g,
      "<mark style='background:#fef3c7;color:#92400e;padding:1px 5px;border-radius:3px;font-weight:500;'>$1</mark>"
    )
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
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
      lines.push("<tr>" + cells.map((c) => `<${tag} style='${style}'>${inlineHtml(c)}</${tag}>`).join("") + "</tr>");
      firstRow = false;
      continue;
    } else if (inTable) {
      lines.push("</table>");
      inTable = false;
    }

    if (line.startsWith("### ")) lines.push(`<h3 style='color:#333;margin-top:25px;font-size:16px;'>${line.slice(4)}</h3>`);
    else if (line.startsWith("## ")) lines.push(`<h2 style='color:#1a56db;margin-top:35px;padding-bottom:10px;border-bottom:2px solid #1a56db;font-size:20px;'>${line.slice(3)}</h2>`);
    else if (line.startsWith("# ")) lines.push(`<h1 style='color:#111;font-size:28px;'>${line.slice(2)}</h1>`);
    else if (line.startsWith("- ")) lines.push(`<li style='margin:8px 0 8px 20px;'>${inlineHtml(line.slice(2))}</li>`);
    else if (line === "---") lines.push("<hr style='margin:25px 0;border:none;border-top:1px solid #e5e7eb;'>");
    else if (line) lines.push(`<p style='margin:12px 0;line-height:1.7;'>${inlineHtml(line)}</p>`);
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

// Reused across requests — launching a browser per export takes ~1s and this
// avoids that cost after the first PDF export.
let browserPromise = null;

function isAlive(browser) {
  // `connected` is a getter in puppeteer >= 23, `isConnected()` in older versions.
  return typeof browser.connected === "boolean" ? browser.connected : browser.isConnected?.() ?? false;
}

async function getBrowser() {
  if (browserPromise) {
    try {
      const existing = await browserPromise;
      if (isAlive(existing)) return existing;
    } catch {
      // Previous launch failed — fall through and try again below.
    }
    browserPromise = null;
  }

  // Chrome can die between exports (idle shutdown, crash, OS kill). Without
  // this re-launch every later export would fail with "Connection closed"
  // until the server was restarted.
  browserPromise = puppeteer.launch({ headless: true }).catch((err) => {
    browserPromise = null;
    throw err;
  });
  return browserPromise;
}

export async function toPdf(prd) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(toHtml(prd), { waitUntil: "networkidle0" });
    const bytes = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "16mm", right: "16mm" },
    });
    return Buffer.from(bytes);
  } finally {
    await page.close();
  }
}
