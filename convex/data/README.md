# Richard Memory Module

This directory contains the grounding memory for Richard's AI assistant and the
utilities that expose it to Convex functions.

## Files

### `richard-memory.md`
The single source of truth for all professional information — summary, focus
areas, career timeline, signature projects, portfolio, skills, certifications,
education, and contact details. Edit this file when anything changes.

### `richardMemory.ts`
The runtime module consumed by Convex. It embeds the markdown as a string
(Convex bundles function code, so reading local files at runtime is not safe)
and exposes:

- `richardMemory` — parsed header fields (name, email, LinkedIn, Calendly, ...)
  plus the full markdown.
- `getSection(title)` — returns the body of a `## Section` from the markdown.

Never edit the embedded string by hand — it is generated.

## Updating the resume / memory (the publish flow)

1. Edit `convex/data/richard-memory.md` with the new information.
2. Run `pnpm memory:sync` to regenerate `convex/data/richardMemory.ts`.
3. Run `pnpm test:run` to confirm the grounding tests still pass.
4. Commit both files together.

CI runs `pnpm memory:check` and fails if the two files are out of sync.

## Structure conventions

Keep these stable — code and tests depend on them:

- Header fields at the top (`Name:`, `Email:`, `Summary:`, ...) are parsed by
  `getField` in `richardMemory.ts`.
- `## AI Product Management Focus`, `## Data & Analytics Focus`,
  `## Web3 & Blockchain Focus`, and `## Product Strategy & Execution Focus`
  are looked up by name in `convex/helpers/systemPrompt.ts` for focused
  prompts.
- Career entries use `### Company | Title | Start - End` headings with bullet
  achievements, so the assistant can cite concrete evidence.

## Integration points

This module is used by:

- `convex/helpers/systemPrompt.ts` — prompt generation
  (`generateSystemInstructions`, `generateFocusedPrompt`, `getContactInfo`).
- `convex/chat/` — the chat handlers that instantiate the assistant.
- `scripts/sync-richard-memory.mjs` — the `memory:sync` / `memory:check`
  commands.
