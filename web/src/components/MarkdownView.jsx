// Minimal renderer for the markdown subset our own prompts produce:
// headers, **bold**/*italic*, "- " bullet lists, "|"-tables, and "---" rules.
// Editing still works on the raw markdown string; this is read-view only.

function inline(text, keyPrefix) {
  const parts = text.split(/(\*\*.+?\*\*|\*[^*\s].*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`${keyPrefix}-${i}`}>{part.slice(1, -1)}</em>;
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

function isTableSeparator(line) {
  return line.replace(/ /g, "").replace(/\|/g, "").replace(/-/g, "") === "";
}

function parseTableRow(line) {
  return line.split("|").slice(1, -1).map((c) => c.trim());
}

export default function MarkdownView({ content }) {
  const nodes = [];
  const lines = (content || "").split("\n");

  let listBuffer = [];
  let tableBuffer = [];
  let inTable = false;

  const checkboxMatch = (item) => item.match(/^\[( |x|X)\]\s+(.*)$/);

  const flushList = (key) => {
    if (!listBuffer.length) return;
    const isChecklist = listBuffer.every((item) => checkboxMatch(item));
    nodes.push(
      <ul key={`ul-${key}`} className={isChecklist ? "space-y-1.5 my-2 list-none pl-0" : "list-disc pl-5 space-y-1 my-2"}>
        {listBuffer.map((item, i) => {
          const box = checkboxMatch(item);
          if (box) {
            const checked = box[1].toLowerCase() === "x";
            return (
              <li key={i} className="flex items-center gap-2">
                <input type="checkbox" checked={checked} readOnly className="h-3.5 w-3.5 rounded border-slate-300" />
                <span className={checked ? "text-slate-400 line-through" : ""}>{inline(box[2], `li-${key}-${i}`)}</span>
              </li>
            );
          }
          return <li key={i}>{inline(item, `li-${key}-${i}`)}</li>;
        })}
      </ul>
    );
    listBuffer = [];
  };

  const flushTable = (key) => {
    if (!tableBuffer.length) return;
    const [header, ...rows] = tableBuffer;
    nodes.push(
      <div key={`table-${key}`} className="my-3 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {header.map((cell, i) => (
                <th key={i} className="border-b border-slate-200 bg-slate-50/80 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {inline(cell, `th-${key}-${i}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, r) => (
              <tr key={r} className="transition-colors hover:bg-slate-50/60">
                {row.map((cell, c) => (
                  <td key={c} className="px-3 py-2.5 align-top text-slate-700">
                    {inline(cell, `td-${key}-${r}-${c}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();

    if (line.startsWith("|")) {
      inTable = true;
      if (!isTableSeparator(line)) tableBuffer.push(parseTableRow(line));
      return;
    } else if (inTable) {
      flushTable(idx);
      inTable = false;
    }

    if (line.startsWith("- ")) {
      listBuffer.push(line.slice(2));
      return;
    } else if (listBuffer.length) {
      flushList(idx);
    }

    if (!line) return;
    if (line.startsWith("### ")) nodes.push(<h4 key={idx} className="mb-1 mt-4 text-sm font-semibold tracking-tight text-slate-900">{line.slice(4)}</h4>);
    else if (line.startsWith("## ")) nodes.push(<h3 key={idx} className="mb-1.5 mt-5 text-base font-bold tracking-tight text-slate-900">{line.slice(3)}</h3>);
    else if (line.startsWith("# ")) nodes.push(<h2 key={idx} className="mb-1.5 mt-5 text-lg font-bold tracking-tight text-slate-900">{line.slice(2)}</h2>);
    else if (line === "---") nodes.push(<hr key={idx} className="my-4 border-slate-100" />);
    else nodes.push(<p key={idx} className="my-1.5 leading-relaxed text-slate-600">{inline(line, `p-${idx}`)}</p>);
  });

  flushList("end");
  flushTable("end");

  return <div className="text-[15px] leading-relaxed">{nodes}</div>;
}
