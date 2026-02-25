import { api } from "@/trpc/react";

import { useLocalStorage } from "usehooks-ts";

export const useProjects = () => {
  const { data: projects, isLoading } = api.project.getAll.useQuery();
  const [projectId, setProjectId] = useLocalStorage("projectId", "");
  const project = projects?.find((p) => p.id === projectId);
  return {
    projects: projects ?? [],
    isLoading,
    projectId,
    setProjectId,
    project,
  };
};
