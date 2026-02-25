import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";

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
});
