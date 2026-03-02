"use client";
import { useProjects } from "@/hooks/use-projects";
import { api } from "@/trpc/react";
import React from "react";

const TeamMembers = () => {
  const { projectId } = useProjects();
  const { data: members } = api.project.getTeamMembers.useQuery({
    projectId,
  });
  return (
    <div className="flex items-center gap-2">
      {members?.slice(0, 3)?.map((member) => (
        <img
          key={member.id}
          src={member.user.imageUrl || ""}
          alt={member.user.firstName || ""}
          height={30}
          width={30}
          className="rounded-full"
        />
      ))}
    </div>
  );
};

export default TeamMembers;
