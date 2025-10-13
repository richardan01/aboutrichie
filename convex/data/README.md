# Resume Data Module

This directory contains structured data extracted from Richard Ng's resume and utilities for generating AI system prompts.

## Files

### `resumeData.ts`
Contains all professional information in structured TypeScript objects:

- **personalInfo**: Contact details and social links
- **professionalSummary**: Brief professional overview
- **experience**: Array of work experiences with achievements and keywords
- **portfolios**: Notable projects and hackathons
- **skills**: Categorized technical and professional skills
- **education**: Academic background
- **keyMetrics**: Quick reference metrics for impact
- **expertiseAreas**: Organized by domain (AI/ML, Product Management, Data & Analytics, Web3)

## Usage

### In Chat Actions

```typescript
import { generateSystemInstructions } from "../helpers/systemPrompt";

// Generate comprehensive system instructions
const systemInstructions = generateSystemInstructions();

// Create AI agent with instructions
const agent = new Agent({
  name: "Richard AI Assistant",
  instructions: systemInstructions,
  model: "gpt-4o-mini",
});
```

### Focused Prompts

```typescript
import { generateFocusedPrompt } from "../helpers/systemPrompt";

// Generate focused prompt for specific area
const aiPrompt = generateFocusedPrompt('ai');
const dataPrompt = generateFocusedPrompt('data');
const web3Prompt = generateFocusedPrompt('web3');
const productPrompt = generateFocusedPrompt('product');
```

### Contact Information

```typescript
import { getContactInfo, getBriefIntro } from "../helpers/systemPrompt";

const intro = getBriefIntro();
const contact = getContactInfo();
```

## Updating Resume Data

When updating the resume:

1. **Update `resumeData.ts`**: Modify the relevant sections with new information
2. **Maintain structure**: Keep the TypeScript types and structure intact
3. **Update keywords**: Add relevant keywords for better context matching
4. **Test prompts**: Verify that `systemPrompt.ts` generates correct instructions

## Benefits of This Structure

1. **Single Source of Truth**: All resume data in one place
2. **Type Safety**: TypeScript ensures data consistency
3. **Easy Maintenance**: Update once, reflect everywhere
4. **Flexible**: Generate different prompts for different contexts
5. **Testable**: Can easily test prompt generation logic
6. **Version Control**: Track changes to professional information over time

## Example: Adding New Experience

```typescript
export const experience = [
  {
    title: "New Position Title",
    company: "Company Name",
    location: "Location",
    period: "Start Date - End Date",
    achievements: [
      "Achievement 1 with quantifiable impact",
      "Achievement 2 with metrics",
    ],
    keywords: ["relevant", "keywords", "for", "context"],
  },
  // ... existing experiences
] as const;
```

## Integration Points

This module is used by:
- `convex/chat/actions.ts` - Main chat handler
- `convex/helpers/systemPrompt.ts` - Prompt generation
- Future: Can be used for resume exports, portfolio displays, etc.
