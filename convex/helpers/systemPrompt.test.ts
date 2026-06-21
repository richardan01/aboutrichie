import { describe, expect, it } from "vitest";
import {
  generateFocusedPrompt,
  generateSystemInstructions,
  getContactInfo,
} from "./systemPrompt";

describe("Richard AI grounding prompts", () => {
  it("grounds the main prompt in Richard's memory and concrete evidence", () => {
    const prompt = generateSystemInstructions();

    expect(prompt).toContain("Richard Ng Wai Leung");
    expect(prompt).toContain("Finance GenAI Assistant");
    expect(prompt).toContain("70%+ adoption");
    expect(prompt).toContain("5,000+ employees");
  });

  it("instructs the assistant not to invent missing facts", () => {
    const prompt = generateSystemInstructions();

    expect(prompt).toContain("say you do not have that detail rather than inventing it");
    expect(prompt).toContain("Never mention technologies or achievements that are not explicitly grounded");
  });

  it("creates focused prompts from the requested memory section", () => {
    const aiPrompt = generateFocusedPrompt("ai");
    const dataPrompt = generateFocusedPrompt("data");

    expect(aiPrompt).toContain("agentic workflows");
    expect(aiPrompt).toContain("human-in-the-loop design");
    expect(dataPrompt).toContain("semantic discovery");
    expect(dataPrompt).toContain("data governance");
  });

  it("returns grounded contact information", () => {
    const contact = getContactInfo();

    expect(contact).toContain("richardconstantine67@gmail.com");
    expect(contact).toContain("linkedin.com/in/richieriri");
    expect(contact).toContain("calendly.com/richieriri/30min");
  });
});
