import * as fs from "fs";
import * as path from "path";

/**
 * Scans all source and test files to guarantee no personal strings from the test CV
 * exist anywhere in the codebase.
 */
export function checkForbiddenStrings(srcDir: string = process.cwd()): { clean: boolean; violations: string[] } {
  const forbiddenFile = path.join(process.cwd(), ".forbidden-strings.json");
  if (!fs.existsSync(forbiddenFile)) {
    return { clean: true, violations: [] };
  }

  const forbiddenStrings: string[] = JSON.parse(fs.readFileSync(forbiddenFile, "utf-8"));
  const violations: string[] = [];

  const targetDirs = ["src", "tests", "lib", "app", "components"];

  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== ".git") {
          scanDir(fullPath);
        }
      } else if (/\.(ts|tsx|js|jsx|json|md)$/i.test(entry.name)) {
        // Skip the report file itself, forbidden file, and landing/legal marketing pages
        if (
          entry.name === ".forbidden-strings.json" ||
          entry.name === "fitted-test-report.md" ||
          fullPath.includes(path.join("src", "app", "page.tsx")) ||
          fullPath.includes(path.join("src", "app", "privacy")) ||
          fullPath.includes(path.join("src", "app", "terms")) ||
          fullPath.includes(path.join("src", "components", "landing"))
        ) {
          continue;
        }

        const content = fs.readFileSync(fullPath, "utf-8");
        for (const forbidden of forbiddenStrings) {
          if (content.includes(forbidden)) {
            violations.push(`${path.relative(srcDir, fullPath)} contains forbidden string: "${forbidden}"`);
          }
        }
      }
    }
  }

  for (const d of targetDirs) {
    scanDir(path.join(srcDir, d));
  }

  return {
    clean: violations.length === 0,
    violations,
  };
}
