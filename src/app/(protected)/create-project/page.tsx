"use client";

import { Input } from "@/components/ui/input";
import Image from "next/image";
import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRefetch } from "@/hooks/use-refetch";

type FormInputs = {
  projectName: string;
  repoUrl: string;
  githubToken?: string;
};
const CreateProjectPage = () => {
  const { register, handleSubmit, reset } = useForm<FormInputs>();
  const createProject = api.project.create.useMutation();
  const refetch = useRefetch();

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    createProject.mutate(
      {
        name: data.projectName,
        repoUrl: data.repoUrl,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
          refetch();
          reset();
        },
        onError: () => {
          toast.error("Something went wrong");
        },
      },
    );
    reset();
  };
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="mx-auto flex w-fit flex-col items-center gap-4 p-6 md:flex-row">
        <DotLottieReact
          src="https://lottie.host/c9f38f6f-b4e4-4635-b5c7-3b079fa95bf8/FC65vJvy8P.lottie"
          loop
          autoplay
          className="hidden h-84 w-1/2 sm:block"
        />
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">
            Link Your Github Repository
          </h2>
          <p>Enter the url of your github repository to link it to GitMind</p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            <Input
              className="w-full"
              {...register("projectName", { required: true })}
              placeholder="Project Name"
            />
            <Input
              className="w-full"
              {...register("repoUrl", { required: true })}
              placeholder="Github Repository URL"
              type="url"
            />
            <Input
              className="w-full"
              {...register("githubToken")}
              placeholder="Github Token (Optional)"
            />
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Project"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;
