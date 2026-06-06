"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/use-projects";
import { useRefetch } from "@/hooks/use-refetch";
import { uploadFileToSupabase } from "@/lib/supabase";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Presentation, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const MeetingCard = () => {
  const { user } = useUser();
  const { projectId } = useProjects();
  const router = useRouter();
  const refetch = useRefetch();

  const processMeeting = useMutation({
    mutationFn: async (data: {
      meetingUrl: string;
      projectId: string;
      meetingId: string;
    }) => {
      const { meetingUrl, projectId, meetingId } = data;
      try {
        const response = await axios.post(`/api/process-meeting`, {
          meetingUrl,
          projectId,
          meetingId,
        });
        return response.data;
      } catch (error) {
        console.log(error);
      }
    },
  });
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const uploadMeeting = api.project.uploadMeeting.useMutation();
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (!file) return;
      const publicUrl = await uploadFileToSupabase(
        file as File,
        user?.id!,
      );
      uploadMeeting.mutate(
        {
          projectId,
          meetingUrl: publicUrl,
          name: file.name,
        },
        {
          onSuccess: (meeting) => {
            toast.success("Meeting uploaded successfully");
            router.push("/meetings");
            refetch();
            processMeeting.mutateAsync({
              meetingUrl: publicUrl,
              projectId,
              meetingId: meeting.id,
            });
          },
          onError: () => {
            toast.error("Something went wrong");
          },
        },
      );
      setIsUploading(false);
    },
  });
  return (
    <Card
      className="col-span-2 flex w-full items-center justify-center gap-0"
      {...getRootProps()}
    >
      {!isUploading ? (
        <>
          <Presentation className="size-10 animate-bounce" />
          <h3 className="mt-2 font-semibold text-neutral-900">
            Upload a new meeting
          </h3>
          <div>
            <p className="mt-1 text-center text-sm text-neutral-500">
              Analyze your meeting with GitMind
            </p>
            <p className="text-center text-sm text-neutral-500">
              Powered by AI
            </p>
          </div>
          <div className="mt-6">
            <Button disabled={isUploading}>
              <UploadIcon className="size-5" aria-hidden="true" />
              Upload Meeting
              <Input {...getInputProps()} className="hidden" />
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <Loader2 className="size-12 animate-spin text-blue-600" />
        </div>
      )}
    </Card>
  );
};

export default MeetingCard;
