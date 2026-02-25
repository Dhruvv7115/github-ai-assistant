"use client";
import { useProjects } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";

const CommitLog = () => {
  const { projectId, project } = useProjects();
  const { data: commits } = api.project.getCommits.useQuery({
    projectId,
  });
  return (
    <section>
      <ul className="space-y-6">
        {commits?.map((commit, index) => (
          <li key={index} className="flex gap-x-4">
            <div className="relative">
              <img
                src={commit.authorAvatar}
                alt="author avatar"
                className="relative z-50 mt-4 size-8 flex-none rounded-full bg-gray-50"
              />
              <div
                className={cn(
                  "absolute left-1/2 z-20 h-full w-px -translate-x-1/2 bg-gray-200",
                  {
                    "top-10": index === 0,
                    "bottom-20": index === commits.length - 1,
                  },
                )}
              ></div>
            </div>
            <div className="flex-col w-full rounded-md bg-white p-3 ring-1 ring-gray-200 ring-inset">
              <div className="flex justify-between gap-x-4">
                <Link
                  href={`${project?.url}/commit/${commit.hash}`}
                  target="_blank"
                  className="py-0.5 text-sm leading-5 text-neutral-500"
                >
                  <span className="font-medium text-neutral-900">
                    {commit.authorName}
                  </span>
                  <span className="ml-2 inline-flex items-start">
                    commited
                    <ExternalLink className="ml-1 size-4" />
                  </span>
                </Link>
              </div>
              <span className="font-semibold">{commit.message}</span>
              <pre className="mt-2 text-sm leading-6 whitespace-pre-wrap text-neutral-500">
                {commit.summary}
              </pre>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default CommitLog;
