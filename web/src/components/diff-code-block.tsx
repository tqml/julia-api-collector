import { DiffLine } from "@/lib/diff";

interface DiffCodeBlockProps {
  diff: DiffLine[];
  show: "additions" | "deletions";
  showNormal?: boolean;
}

export function DiffCodeBlock({
  diff,
  show,
  showNormal = true,
}: DiffCodeBlockProps) {
  return (
    <pre
      className="max-h-[600px] overflow-auto rounded-lg bg-background p-4 font-mono text-sm"
      style={{ tabSize: 2 }}
    >
      <code>
        {diff.map((line, i) => {
          if (line.type === "+" && show === "additions") {
            return (
              <div
                key={i}
                className="bg-green-500/10 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              >
                + {line.content}
              </div>
            );
          } else if (line.type === "-" && show === "deletions") {
            return (
              <div
                key={i}
                className="bg-red-500/10 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              >
                - {line.content}
              </div>
            );
          } else if (line.type === " " && showNormal) {
            return <div key={i}>&nbsp;&nbsp;{line.content}</div>;
          } else {
            return null;
          }
        })}
      </code>
    </pre>
  );
}
