import { api } from "@/trpc/react";
import { useState } from "react";
import { useLocalStorage } from "./use-localstorage";

export const useProjects = () => {
  const { data: projects, isLoading } = api.project.getAll.useQuery();
  const [projectId, setProjectId] = useLocalStorage("projectId", null);
  const project = projects?.find((p) => p.id === projectId);
  return {
    projects: projects ?? [],
    isLoading,
    projectId,
    setProjectId,
    project,
  };
};
