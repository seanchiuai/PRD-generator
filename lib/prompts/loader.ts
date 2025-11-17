/**
 * Prompt Loader Utility
 *
 * Loads prompts from markdown files at runtime.
 * This centralizes prompt management and makes prompts easier to edit.
 */

import fs from "fs";
import path from "path";

/**
 * Load a prompt from a markdown file
 * @param filename - Name of the markdown file (without .md extension)
 * @returns The prompt content as a string
 */
export function loadPrompt(filename: string): string {
  const promptPath = path.join(process.cwd(), "lib", "prompts", "markdowns", `${filename}.md`);
  try {
    return fs.readFileSync(promptPath, "utf-8");
  } catch (error) {
    throw new Error(`Failed to load prompt "${filename}" from ${promptPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
