"use client";
import { useProjects } from "@/hooks/use-projects";
import { api } from "@/trpc/react";
import React from "react";
import MeetingCard from "../dashboard/meeting-card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Loader2, Presentation, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRefetch } from "@/hooks/use-refetch";

const MeetingsPage = () => {
  const { projectId } = useProjects();
  const deleteMeeting = api.project.deleteMeeting.useMutation();
  const refetch = useRefetch();

  const { data: meetings } = api.project.getMeetings.useQuery(
    {
      projectId,
    },
    {
      refetchInterval: 4000,
    },
  );
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6">
      <MeetingCard />
      <div className="flex w-full flex-col items-start justify-center gap-2">
        <h1 className="text-xl font-semibold text-black/80">Meetings</h1>
        {meetings && meetings.length === 0 && (
          <Empty className="w-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Presentation className="text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No Meetings Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t uploaded any meetings yet. Get started by
                uploading your first meeting.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button>
                <Upload />
                Upload Meeting
              </Button>
            </EmptyContent>
          </Empty>
        )}
        <ul className="w-full divide-y divide-neutral-200">
          {meetings?.map((meeting) => (
            <li
              key={meeting.id}
              className="flex items-center justify-between gap-x-6 py-5"
            >
              <div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/meetings/${meeting.id}`}
                      className="text-sm font-semibold"
                    >
                      {meeting.name}
                    </Link>
                    {meeting.status === "PROCESSING" && (
                      <Badge className="bg-yellow-400 text-white">
                        <Loader2 className="animate-spin" />
                        Processing...
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-x-2 text-xs text-neutral-500">
                  <p className="whitespace-nowrap">
                    {meeting.createdAt.toLocaleDateString()}
                  </p>
                  <p className="truncate">{meeting.issues.length}</p>
                </div>
              </div>
              <div className="flex flex-none items-center gap-x-4">
                <Link href={`/meetings/${meeting.id}`}>
                  <Button variant="outline" size="sm">
                    View Meeting
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteMeeting.isPending}
                  onClick={() => {
                    deleteMeeting.mutate(
                      {
                        meetingId: meeting.id,
                      },
                      {
                        onSuccess: () => {
                          toast.success("Meeting deleted successfully");
                          refetch();
                        },
                        onError: () => {
                          toast.error("Something went wrong");
                        },
                      },
                    );
                  }}
                >
                  Delete Meeting
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MeetingsPage;
