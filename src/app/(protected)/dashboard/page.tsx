"use client";

import { useProjects } from "@/hooks/use-projects";
import { useUser } from "@clerk/nextjs";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import MeetingCard from "./meeting-card";
import ArchiveButton from "./archive-button";
import InviteButton from "./invite-button";
import TeamMembers from "./team-members";

const DashboardPage = () => {
  const { project } = useProjects();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        <div className="bg-primary w-fit rounded-md px-4 py-3">
          {/* github link of the project */}
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{project?.name}</p>
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
          <TeamMembers />
          <InviteButton />
          <ArchiveButton />
        </div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <AskQuestionCard />
          <MeetingCard />
        </div>
        <div className="mt-4"></div>
        <CommitLog />
      </div>
    </div>
  );
};

export default DashboardPage;
