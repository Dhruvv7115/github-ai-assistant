import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import type { Document } from "@langchain/core/documents";
import { getEmbedding, summarizeCode } from "./gemini";
import { db } from "@/server/db";
import { Octokit } from "octokit";

export const getFileCount = async (githubUrl: string, githubToken?: string) => {
  const octokit = new Octokit({
    auth: githubToken,
  });
  const repoOwner = githubUrl.split("/")[3];
  const repoName = githubUrl.split("/")[4];

  const { data } = await octokit.rest.git.getTree({
    owner: repoOwner!,
    repo: repoName!,
    tree_sha: "main",
    recursive: "1",
  });

  const fileCount = data.tree.filter((item) => item.type === "blob").length;
  return fileCount;
};
// console.log(
//   "file count",
//   await getFileCount("https://github.com/Dhruvv7115/trading-bot-n8n"),
// );

export const loadGithubRepo = async (repoUrl: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(repoUrl, {
    branch: "main",
    recursive: true,
    accessToken: githubToken ?? "",
    ignoreFiles: [
      "**/.DS_Store",
      "**/yarn.lock",
      "**/package-lock.json",
      "**/pnpm-lock.yaml",
      "**/bun.lock",
    ],
    unknown: "warn",
    maxConcurrency: 5,
  });
  const docs = await loader.load();
  return docs;
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
    if (!summary) {
      console.log(`Skipping ${doc.metadata.source} - empty summary`);
      continue; // skip files with no summary
    }

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
      sourceCode: JSON.parse(JSON.stringify(doc.pageContent)) as string,
      fileName: doc.metadata.source as string,
    });
  }
  return embeddings;
};
