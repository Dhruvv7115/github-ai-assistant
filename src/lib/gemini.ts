import { GoogleGenAI } from "@google/genai";
import type { Document } from "@langchain/core/documents";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const getAiSummary = async (diff: string): Promise<string> => {
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",

    contents: [
      `You are an expert programmer, and you are trying to summarize a git diff.
      Reminders about the git diff format:
      For every file, there are a few metadata lines, like (for example):
      \`\`\`
      diff --git a/lib/index.js b/lib/index.js
      index aadf691..bfef603 100644
      --- a/lib/index.js
      +++ b/lib/index.js
      \`\`\`
      This means that \`lib/index.js\` was modified in this commit.
      A line starting with \`+\` means it was added.
      A line starting with \`-\` means it was deleted.
      A line that starts with neither \`+\` nor \`-\` is code given for context.

      EXAMPLE SUMMARY COMMENTS:
      \`\`\`
      * Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts]
      * Fixed a typo in the github action name [.github/workflows/staging.yml]
      * Moved the \`octokit\` initialization to a separate file [src/octokit.ts]
      \`\`\`
      Most commits will have less comments than this example.
      If there are more than two relevant files, do not include file names.
      Do not include parts of the example in your summary.

      Here is the git diff you need to summarize:
      ${diff}`,
    ],
  });
  return response.text || "";
};

// await getAiSummary(`diff --git a/apps/client/src/pages/CreateWorkflow.tsx b/apps/client/src/pages/CreateWorkflow.tsx
// index 07fd8de..b0fd66d 100644
// --- a/apps/client/src/pages/CreateWorkflow.tsx
// +++ b/apps/client/src/pages/CreateWorkflow.tsx
// @@ -16,7 +16,7 @@ export default function CreateWorkflowPage() {
//  			// 1. Create Workflow
//  			const response = await workflowApi.create({
//  				name,
// -				active: false,
// +				active: true,
//  			});

//  			if (!response.workflow || !response.workflow._id) {`);

export const summarizeCode = async (doc: Document) => {
  try {
    const sourceCode = doc.pageContent;
    const slicedCode = sourceCode.slice(0, 5000);
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        `you are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects, you are onboarding a junior software engineer and explaining to them the purpose of ${doc.metadata.source} file. 
        Here is the code:
          ---
          ${slicedCode}
          ---
        give a summary no more than 100 words of the code and what it does
        `,
      ],
    });

    return response.text || "";
  } catch (error) {
    return "";
  }
};

export const getEmbedding = async (summary: string) => {
  const response = await genAI.models.embedContent({
    model: "gemini-embedding-001",
    contents: summary,
  });
  return response.embeddings?.[0]?.values ?? [];
};

// const response = await genAI.models.generateContentStream({
//   model: "gemini-2.5-flash",
//   contents: "Write a story about a magic backpack.",
// });
// let text = "";
// for await (const chunk of response) {
//   console.log(chunk.text);
//   text += chunk.text;
// }