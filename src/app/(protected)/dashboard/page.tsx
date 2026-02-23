"use client";

import { useProjects } from "@/hooks/use-projects";
import { useUser } from "@clerk/nextjs";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";

const DashboardPage = () => {
  const { project } = useProjects();
  const { user } = useUser();
  console.log(user);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        <div className="bg-primary w-fit rounded-md px-4 py-3">
          {/* github link of the project */}
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {project?.name}
              </p>
              <Link
                href={project?.url ?? ""}
                className="flex items-center justify-center gap-1 text-xs font-medium text-white/80 hover:text-white hover:underline"
              >
                {project?.url}
                <ExternalLink className="size-3" />
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          TeamMembers
          InviteButton 
          ArchiveButton
        </div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          AskQuestionCard
          MeetingCard
        </div>
        <div className="mt-4"></div>
        CommitLogs
      </div>
    </div>
  );
};

export default DashboardPage;
