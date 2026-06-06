"use client";

import { Input } from "@/components/ui/input";
import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Info, Loader2 } from "lucide-react";
import { useRefetch } from "@/hooks/use-refetch";
import { useRouter } from "next/navigation";

type FormInputs = {
  projectName: string;
  repoUrl: string;
  githubToken?: string;
};
const CreateProjectPage = () => {
  const { register, handleSubmit, reset } = useForm<FormInputs>();
  const createProject = api.project.create.useMutation();
  const checkCredits = api.project.checkCredits.useMutation();
  const refetch = useRefetch();
  const router = useRouter();

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    if (!!checkCredits.data) {
      createProject.mutate(
        {
          name: data.projectName,
          repoUrl: data.repoUrl,
          githubToken: data.githubToken,
        },
        {
          onSuccess: () => {
            toast.success("Project created successfully");
            void refetch();
            reset();
            router.push("/dashboard");
          },
          onError: () => {
            toast.error("Something went wrong");
          },
        },
      );
    } else {
      checkCredits.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
      });
    }
  };
  const hasEnoughCredits =
    checkCredits?.data?.fileCount && checkCredits?.data?.userCredits
      ? checkCredits.data?.fileCount <= checkCredits.data?.userCredits
      : true;
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
            {!!checkCredits.data &&
              checkCredits.data.fileCount < checkCredits.data.userCredits && (
                <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700">
                  <div className="flex items-center gap-2">
                    <Info className="size-4" />
                    <p className="text-sm">
                      You will be charged{" "}
                      <strong>{checkCredits.data?.fileCount}</strong> credits
                      for this repository.
                    </p>
                  </div>
                  <p className="text-sm">
                    You have <strong>{checkCredits.data?.userCredits}</strong>{" "}
                    credits remaining.
                  </p>
                </div>
              )}
            <Button
              type="submit"
              disabled={
                createProject.isPending ||
                checkCredits.isPending ||
                !hasEnoughCredits
              }
            >
              {!checkCredits.data && !checkCredits.isPending ? (
                "Check Credits"
              ) : checkCredits.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" />
                  Checking Credits...
                </span>
              ) : createProject.isPending ? (
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
