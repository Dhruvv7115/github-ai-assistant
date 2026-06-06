"use client";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-projects";
import { useRefetch } from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React from "react";
import { toast } from "sonner";

const ArchiveButton = async () => {
  const { projectId } = useProjects();
  const archiveProject = api.project.archiveProject.useMutation();
  const refetch = await useRefetch();
  return (
    <Button
      variant="outline"
      disabled={archiveProject.isPending}
      size="sm"
      onClick={() => {
        const confirm = window.confirm(
          "Are you sure you want to archive this project?",
        );
        if (!confirm) return;
        archiveProject.mutate(
          {
            projectId,
          },
          {
            onSuccess: () => {
              toast.success("Project archived successfully!");
              refetch();
            },
            onError: () => {
              toast.error("Failed to archive this project!");
            },
          },
        );
      }}
    >
      {" "}
      Archive
    </Button>
  );
};

export default ArchiveButton;
