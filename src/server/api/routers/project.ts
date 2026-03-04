import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { getFileCount, indexGithubRepo } from "@/lib/github-loader";
import { genAI, getEmbedding } from "@/lib/gemini";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        repoUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.user.userId!,
        },
        select: {
          credits: true,
        },
      });
      if (!user) throw new Error("User not found");
      const creditsRequired = await getFileCount(
        input.repoUrl,
        input.githubToken,
      );
      if (user.credits < creditsRequired) {
        throw new Error("Not enough credits");
      }
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          url: input.repoUrl,
          userToProjects: {
            create: {
              userId: ctx.user.userId!,
            },
          },
        },
      });
      await indexGithubRepo(project.id, input.repoUrl, input.githubToken);
      console.log("indexed repo, starting polling commits in 10 seconds");
      await new Promise((resolve) => setTimeout(resolve, 10000));
      await pollCommits(project.id);
      await ctx.db.user.update({
        where: {
          id: ctx.user.userId!,
        },
        data: {
          credits: {
            decrement: creditsRequired,
          },
        },
      });
      return project;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        userToProjects: {
          some: {
            userId: ctx.user.userId!,
          },
        },
        deletedAt: null,
      },
    });
  }),
  getCommits: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      pollCommits(input.projectId).then(console.log).catch(console.error);
      return await ctx.db.commit.findMany({
        where: {
          projectId: input.projectId,
        },
      });
    }),

  askQuestion: protectedProcedure
    .input(
      z.object({
        question: z.string(),
        projectId: z.string(),
      }),
    )
    .subscription(async function* ({ ctx, input }) {
      const { question, projectId } = input;

      const embedding = await getEmbedding(question);
      const vectorQuery = `[${embedding.join(",")}]`;

      const result = (await ctx.db.$queryRaw`
        SELECT "fileName", "sourceCode", "summary",
        1 - ("summaryEmbedding" <-> ${vectorQuery}::vector) AS "similarity"
        FROM "SourceCodeEmbedding"
        WHERE "projectId" = ${projectId}
        ORDER BY "similarity" DESC
        LIMIT 5
      `) as {
        fileName: string;
        sourceCode: string;
        summary: string;
      }[];

      let context = "";
      for (const row of result) {
        context += `File: ${row.fileName}\n`;
        context += `Summary: ${row.summary}\n`;
        context += `Source Code: ${row.sourceCode}\n\n`;
      }

      // First, yield the file references
      yield {
        type: "files" as const,
        data: result.map((r) => ({
          fileName: r.fileName,
          sourceCode: r.sourceCode,
          summary: r.summary,
        })),
      };

      const response = await genAI.models.generateContentStream({
        model: "gemini-2.5-flash-lite",
        contents: [
          `You are an intelligent senior software engineer who has deep knowledge of a codebase. 
          You are answering questions for a junior software engineer who is trying to understand the codebase.
          You are given the following context from the most relevant files in the codebase:
          ---
          ${context}
          ---
          Answer the following question about the codebase:
          --- START OF QUESTION ---
          ${question}
          --- END OF QUESTION ---
          Guidelines:
          - Answer in a clear and concise way
          - If the context does not contain enough information to answer the question, say "I don't have enough context to answer this question"
          - Reference specific file names from the context when relevant
          - Keep your answer under 200 words
        `,
        ],
      });

      // Stream each chunk as it arrives
      for await (const chunk of response) {
        yield {
          type: "text" as const,
          data: chunk.text ?? "",
        };
      }
    }),

  saveQuestion: protectedProcedure
    .input(
      z.object({
        question: z.string(),
        answer: z.string(),
        fileReferences: z.array(
          z.object({
            fileName: z.string(),
            sourceCode: z.string(),
            summary: z.string(),
          }),
        ),
        projectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.qna.create({
        data: {
          question: input.question,
          answer: input.answer,
          fileReferences: input.fileReferences,
          projectId: input.projectId,
          userId: ctx.user.userId!,
        },
      });
    }),

  getQnas: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.qna.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  uploadMeeting: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db.meeting.create({
        data: {
          projectId: input.projectId,
          meetingUrl: input.meetingUrl,
          name: input.name,
        },
      });
      return meeting;
    }),
  getMeetings: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.meeting.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          issues: true,
        },
      });
    }),
  deleteMeeting: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.meeting.delete({
        where: {
          id: input.meetingId,
        },
      });
      return true;
    }),

  getMeetingById: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.meeting.findUnique({
        where: {
          id: input.meetingId,
        },
        include: {
          issues: true,
        },
      });
    }),

  archiveProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.project.update({
        where: {
          id: input.projectId,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }),
  getTeamMembers: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.userToProject.findMany({
        where: {
          projectId: input.projectId,
          // userId: {
          //   not: ctx.user.userId!,
          // },
        },
        include: {
          user: true,
        },
      });
    }),
  getMyCredits: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: {
        id: ctx.user.userId!,
      },
      select: {
        credits: true,
      },
    });
  }),
  checkCredits: protectedProcedure
    .input(
      z.object({ githubUrl: z.string(), githubToken: z.string().optional() }),
    )
    .mutation(async ({ ctx, input }) => {
      const fileCount = await getFileCount(input.githubUrl, input.githubToken);
      const userCredits = await ctx.db.user.findUnique({
        where: {
          id: ctx.user.userId!,
        },
        select: {
          credits: true,
        },
      });
      return {
        fileCount,
        userCredits: userCredits?.credits || 0,
      };
    }),
  getUserTransactions: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.stripeTransaction.findMany({
      where: {
        userId: ctx.user.userId!,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        user: true,
      },
    });
  }),
});
