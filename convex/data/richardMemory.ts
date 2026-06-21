import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const memoryPath = fileURLToPath(new URL("./richard-memory.md", import.meta.url));
const markdown = readFileSync(memoryPath, "utf8").trim();

function getField(field: string, fallback = ""): string {
  const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^${escapedField}:\\s*(.+)$`, "m"));
  return match?.[1]?.trim() ?? fallback;
}

export function getSection(title: string): string {
  const marker = `## ${title}`;
  const start = markdown.indexOf(marker);

  if (start === -1) {
    return "";
  }

  const afterHeader = markdown.slice(start + marker.length).replace(/^\r?\n/, "");
  const nextHeaderIndex = afterHeader.search(/^## /m);

  return (nextHeaderIndex === -1 ? afterHeader : afterHeader.slice(0, nextHeaderIndex)).trim();
}

export const richardMemory = {
  markdown,
  name: getField("Name", "Richard Ng Wai Leung"),
  preferredName: getField("PreferredName", "Richard"),
  location: getField("Location", "Singapore"),
  phone: getField("Phone"),
  email: getField("Email"),
  linkedin: getField("LinkedIn"),
  calendly: getField("Calendly"),
  website: getField("Website"),
  summary: getField(
    "Summary",
    "Senior AI Product Manager with 12+ years building enterprise AI and data platforms."
  ),
} as const;
