import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourcePath = fileURLToPath(
  new URL("../convex/data/richard-memory.md", import.meta.url)
);
const runtimePath = fileURLToPath(
  new URL("../convex/data/richardMemory.ts", import.meta.url)
);
const checkOnly = process.argv.includes("--check");

const normalize = (value) => value.replace(/\r\n/g, "\n").trim();
const source = normalize(readFileSync(sourcePath, "utf8"));
const runtime = readFileSync(runtimePath, "utf8");

const rawPattern = /const markdown = String\.raw`([\s\S]*?)`\.trim\(\);/;
const escapedPattern = /const markdown = ("(?:[^"\\]|\\.)*");/;
const rawMatch = runtime.match(rawPattern);
const escapedMatch = runtime.match(escapedPattern);

let embedded;
let declarationPattern;

if (rawMatch) {
  embedded = rawMatch[1];
  declarationPattern = rawPattern;
} else if (escapedMatch) {
  embedded = JSON.parse(escapedMatch[1]);
  declarationPattern = escapedPattern;
} else {
  throw new Error(
    "Could not find the embedded Richard memory in convex/data/richardMemory.ts."
  );
}

if (normalize(embedded) === source) {
  console.log("Richard memory is in sync.");
  process.exit(0);
}

if (checkOnly) {
  console.error(
    "Richard memory is out of sync. Run `pnpm memory:sync` and commit the result."
  );
  process.exit(1);
}

const declaration = `const markdown = ${JSON.stringify(source)};`;
const updatedRuntime = runtime.replace(declarationPattern, declaration);
writeFileSync(runtimePath, updatedRuntime, "utf8");

console.log(
  `Synced convex/data/richardMemory.ts from ${sourcePath.replace(`${root}\\`, "")}.`
);
