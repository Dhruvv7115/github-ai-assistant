import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import type { Document } from "@langchain/core/documents";
import { getEmbedding, summarizeCode } from "./gemini";
import { log } from "console";
import { db } from "@/server/db";
// Document {
//     pageContent: "import { configureStore } from '@reduxjs/toolkit'\nimport authSliceReducer from './authSlice'\nimport postSliceReducer from './postSlice';\n\nconst store = configureStore({\n  reducer: {\n    auth: authSliceReducer,\n    posts: postSliceReducer,\n  }\n});\n\nexport default store",
//     metadata: {
//       source: "src/store/store.js",
//       repository: "https://github.com/dhruvv7115/Blog-App",
//       branch: "main",
//     },
//     id: undefined,
//   }
export const loadGithubRepo = async (repoUrl: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(repoUrl, {
    branch: "main",
    recursive: true,
    accessToken: githubToken || "",
    ignoreFiles: [
      "**/.DS_Store",
      "yarn.lock",
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",
      "bun.lock",
    ],
    unknown: "warn",
    maxConcurrency: 5,
  });
  const docs = await loader.load();
  // Filter out .DS_Store files
  return docs.filter((doc) => !doc.metadata.source?.includes(".DS_Store"));
};

export const indexGithubRepo = async (
  projectId: string,
  repoUrl: string,
  githubToken?: string,
) => {
  const docs = await loadGithubRepo(repoUrl, githubToken);
  console.log("Total files:", docs.length);
  docs.forEach((doc) => {
    console.log(doc.metadata.source);
  });
  const embeddings = await generateEmbeddings(docs);
  for (const embedding of embeddings) {
    console.log(`processing ${embeddings.indexOf(embedding)} embedding`);
    if (!embedding) return;
    const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
      data: {
        sourceCode: embedding.sourceCode,
        fileName: embedding.fileName,
        summary: embedding.summary,
        projectId: projectId,
      },
    });
    await db.$executeRaw`
      UPDATE "SourceCodeEmbedding" 
      SET "summaryEmbedding" = ${embedding.embedding}::vector
      WHERE "id" = ${sourceCodeEmbedding.id}
    `;
    console.log(`processed ${embeddings.indexOf(embedding)} embedding`);
  }
};

const generateEmbeddings = async (docs: Document[]) => {
  // const embeddings = await Promise.all(
  //   docs.map(async (doc) => {
  //     const summary = await summarizeCode(doc);
  //     const embedding = await getEmbedding(summary);
  //     return embedding;
  //   }),
  // );
  const embeddings = [];
  for (const doc of docs) {
    const summary = await summarizeCode(doc);
    await new Promise((resolve) => {
      console.log(
        `processed ${docs.indexOf(doc)} of ${docs.length} embedding, waiting for 5 seconds`,
      );
      setTimeout(resolve, 5000);
    });
    const embedding = await getEmbedding(summary);
    embeddings.push({
      summary,
      embedding,
      sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
      fileName: doc.metadata.source,
    });
  }
  return embeddings;
};
