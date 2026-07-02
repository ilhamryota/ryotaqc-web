import React from "react";

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`([^`]+)`/);
    const italicMatch = remaining.match(/\*(.+?)\*/);

    const matches = [
      boldMatch && { match: boldMatch, type: "bold", index: boldMatch.index! },
      codeMatch && { match: codeMatch, type: "code", index: codeMatch.index! },
      italicMatch && !boldMatch && { match: italicMatch, type: "italic", index: italicMatch.index! },
    ].filter(Boolean).sort((a, b) => a!.index - b!.index);

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches[0]!;
    if (first.index > 0) {
      parts.push(remaining.slice(0, first.index));
    }

    if (first.type === "bold") {
      parts.push(<strong key={key++} className="font-semibold">{first.match[1]}</strong>);
      remaining = remaining.slice(first.index + first.match[0].length);
    } else if (first.type === "code") {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[0.85em] font-mono">
          {first.match[1]}
        </code>
      );
      remaining = remaining.slice(first.index + first.match[0].length);
    } else if (first.type === "italic") {
      parts.push(<em key={key++} className="italic">{first.match[1]}</em>);
      remaining = remaining.slice(first.index + first.match[0].length);
    }
  }

  return parts;
}

function parseTable(lines: string[]): React.ReactNode {
  const rows = lines
    .filter((l) => l.startsWith("|"))
    .map((l) => l.split("|").filter((c) => c.trim() !== ""));

  if (rows.length < 2) return null;

  const header = rows[0];
  const body = rows.slice(2);

  return (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {header.map((cell, i) => (
              <th key={i} className="border border-border px-3 py-2 text-left bg-muted/50 font-semibold">
                {parseInline(cell.trim())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className="border border-border px-3 py-2">
                  {parseInline(cell.trim())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre key={blockKey++} className="my-3 p-4 rounded-lg bg-muted/80 border border-border overflow-x-auto">
          <code className="text-sm font-mono leading-relaxed">{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    if (line.startsWith("| ") && lines[i + 1]?.includes("|---")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const table = parseTable(tableLines);
      if (table) blocks.push(<React.Fragment key={blockKey++}>{table}</React.Fragment>);
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={blockKey++} className="text-lg font-bold mt-5 mb-2 text-foreground">
          {parseInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={blockKey++} className="text-base font-semibold mt-4 mb-1.5 text-foreground">
          {parseInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push(
        <h1 key={blockKey++} className="text-xl font-bold mt-5 mb-2 text-foreground">
          {parseInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    if (line.match(/^(\d+)\.\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push(
        <ol key={blockKey++} className="list-decimal list-inside space-y-1.5 my-3 text-sm leading-relaxed">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-foreground/90">{parseInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* ") || lines[i].startsWith("• "))) {
        listItems.push(lines[i].replace(/^[-*•]\s/, ""));
        i++;
      }
      blocks.push(
        <ul key={blockKey++} className="list-disc list-inside space-y-1.5 my-3 text-sm leading-relaxed">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-foreground/90">{parseInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (line.startsWith("---") || line.startsWith("***")) {
      blocks.push(<hr key={blockKey++} className="my-4 border-border/50" />);
      i++;
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("```") && !lines[i].startsWith("| ") && !lines[i].match(/^\d+\.\s/) && !lines[i].startsWith("- ") && !lines[i].startsWith("* ") && !lines[i].startsWith("• ") && !lines[i].startsWith("---")) {
      paraLines.push(lines[i]);
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push(
        <p key={blockKey++} className="my-2 text-sm leading-relaxed text-foreground/90">
          {parseInline(paraLines.join(" "))}
        </p>
      );
    }
  }

  return <div className="ai-response">{blocks}</div>;
}
