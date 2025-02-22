export type DiffOp = " " | "-" | "+";
export type DiffLine = { type: DiffOp; content: string };

// Simple diff implementation
// In a real app, you might want to use a more sophisticated diff algorithm
export function computeDiff(oldStr: string, newStr: string) {
  const oldLines = oldStr.split("\n");
  const newLines = newStr.split("\n");

  console.log("Number of lines: ", oldLines.length, newLines.length);

  const diff: Array<DiffLine> = [];

  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === newLine) {
      diff.push({ type: " ", content: oldLine || "" });
    } else {
      if (oldLine !== undefined) {
        diff.push({ type: "-", content: oldLine });
      }
      if (newLine !== undefined) {
        diff.push({ type: "+", content: newLine });
      }
    }
  }

  return diff;
}

export function gitDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const m = oldLines.length;
  const n = newLines.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Compute LCS length using DP
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find the diff
  const diff: DiffLine[] = [];
  let i = m,
    j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      diff.push({ type: " ", content: oldLines[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.push({ type: "+", content: newLines[j - 1] });
      j--;
    } else {
      diff.push({ type: "-", content: oldLines[i - 1] });
      i--;
    }
  }

  return diff.reverse();
}
