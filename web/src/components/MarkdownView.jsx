// Minimal renderer for the markdown subset our own prompts produce:
// headers, **bold**, "- " bullet lists, "|"-tables, and "---" rules.
// Editing still works on the raw markdown string; this is read-view only.

function inline(text, keyPrefix) {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{part}</span>
    )
  );
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

  const flushList = (key) => {
    if (!listBuffer.length) return;
    nodes.push(
      <ul key={`ul-${key}`} className="list-disc pl-5 space-y-1 my-2">
        {listBuffer.map((item, i) => (
          <li key={i}>{inline(item, `li-${key}-${i}`)}</li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  const flushTable = (key) => {
    if (!tableBuffer.length) return;
    const [header, ...rows] = tableBuffer;
    nodes.push(
      <div key={`table-${key}`} className="overflow-x-auto my-3">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {header.map((cell, i) => (
                <th key={i} className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold">
                  {inline(cell, `th-${key}-${i}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} className="border border-slate-200 px-3 py-2 align-top">
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
    if (line.startsWith("### ")) nodes.push(<h4 key={idx} className="mt-4 mb-1 text-sm font-semibold text-slate-900">{line.slice(4)}</h4>);
    else if (line.startsWith("## ")) nodes.push(<h3 key={idx} className="mt-4 mb-1 text-base font-bold text-slate-900">{line.slice(3)}</h3>);
    else if (line.startsWith("# ")) nodes.push(<h2 key={idx} className="mt-4 mb-1 text-lg font-bold text-slate-900">{line.slice(2)}</h2>);
    else if (line === "---") nodes.push(<hr key={idx} className="my-3 border-slate-200" />);
    else nodes.push(<p key={idx} className="my-1.5 leading-relaxed text-slate-700">{inline(line, `p-${idx}`)}</p>);
  });

  flushList("end");
  flushTable("end");

  return <div className="text-sm">{nodes}</div>;
}
