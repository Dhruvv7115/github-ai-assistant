"use client";

import { Input } from "@/components/ui/input";
import Image from "next/image";
import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";

type FormInputs = {
  projectName: string;
  repoUrl: string;
  githubToken?: string;
};
const CreateProjectPage = () => {
  const { register, handleSubmit, reset } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    console.log(data);
    alert(JSON.stringify(data, null, 2));
    // reset();
  };
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="mx-auto flex md:flex-row flex-col w-fit items-center gap-4 p-6">
        <DotLottieReact
          src="https://lottie.host/c9f38f6f-b4e4-4635-b5c7-3b079fa95bf8/FC65vJvy8P.lottie"
          loop
          autoplay
          className="h-84 w-1/2 sm:block hidden"
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
              placeholder="Repository URL"
            />
            <Input
              className="w-full"
              {...register("githubToken")}
              placeholder="Github Token (Optional)"
            />
            <Button type="submit">Create Project</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;
