import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { getAiSummary } from "./gemini";
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

type Response = {
  hash: string;
  message: string;
  authorName?: string;
  authorAvatar?: string;
  date?: string;
};
export const getCommitHashes = async (
  githubUrl: string,
): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid github url");
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = data.sort(
    (a, b) =>
      new Date(b.commit.author?.date || "").getTime() -
      new Date(a.commit.author?.date || "").getTime(),
  );

  return sortedCommits.slice(0, 3).map((commit) => ({
    hash: commit?.sha ?? "",
    message: commit?.commit?.message ?? "",
    authorName: commit?.commit?.author?.name ?? "",
    authorAvatar: commit?.author?.avatar_url ?? "",
    date: commit?.commit.author?.date ?? "",
  }));
};

export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );
  const summaryResponses: string[] = [];
  for (const commit of unprocessedCommits) {
    const summary = await summarizeCommit(githubUrl, commit.hash);
    summaryResponses.push(summary);
    await new Promise((resolve) => {
      console.log(
        `processed ${unprocessedCommits.indexOf(commit)} of ${unprocessedCommits.length} commit, waiting for 5 seconds`,
      );
      setTimeout(resolve, 5000);
    });
  }
  const commits = unprocessedCommits.map(async (commit, index) => {
    console.log("processing commit ", index);
    await db.commit.createMany({
      data: {
        projectId,
        hash: commit.hash,
        message: commit.message,
        authorName: commit.authorName!,
        authorAvatar: commit.authorAvatar!,
        date: commit.date!,
        summary: summaryResponses[index]!,
      },
    });
  });
  return commits;
};

async function summarizeCommit(githubUrl: string, commitHash: string) {
  const { data } = await axios.get(`${githubUrl}/commits/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });
  console.log(`Diff size: ${data.length} characters`);
  const summary = await getAiSummary(data);
  return summary;
}

async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      url: true,
    },
  });
  if (!project?.url) {
    throw new Error("Project does not have a github url");
  }
  return { project, githubUrl: project?.url ?? "" };
}

async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Response[],
) {
  const processedCommits = await db.commit.findMany({
    where: {
      projectId: projectId,
    },
    select: {
      hash: true,
    },
  });
  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.hash === commit.hash,
      ),
  );
  return unprocessedCommits;
}
