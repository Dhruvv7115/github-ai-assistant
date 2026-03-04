"use client";
import React from "react";
import AskQuestionCard from "../dashboard/ask-question-card";
import { api } from "@/trpc/react";
import { useProjects } from "@/hooks/use-projects";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import MDEditor from "@uiw/react-md-editor";
import { CodeReferences } from "../dashboard/code-references";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Bot } from "lucide-react";

const QnaPage = () => {
  const { projectId } = useProjects();
  const { data: qnas } = api.project.getQnas.useQuery({
    projectId,
  });
  const [questionIndex, setQuestionIndex] = React.useState<number>(0);
  const question = qnas?.[questionIndex];

  function timeAgo(date: Date | string | number): string {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    const now = new Date();
    const past = new Date(date);

    const diffInSeconds = (past.getTime() - now.getTime()) / 1000;

    const intervals: Record<
      "year" | "month" | "day" | "hour" | "minute" | "second",
      number
    > = {
      year: 31536000,
      month: 2592000,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const unit of Object.keys(intervals) as Array<
      keyof typeof intervals
    >) {
      const value = diffInSeconds / intervals[unit];

      if (Math.abs(value) >= 1) {
        return rtf.format(Math.round(value), unit);
      }
    }

    return "just now";
  }

  return (
    <Sheet>
      <AskQuestionCard />
      <div className="mt-4">
        <h3 className="mb-4 text-xl font-bold text-black/80">
          Saved Questions
        </h3>
        <div className="flex w-full flex-col items-center">
          {qnas?.length === 0 && (
            <Empty className="w-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Bot className="text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>No Q&As Yet</EmptyTitle>
                <EmptyDescription>
                  You haven&apos;t asked any questions yet. Get started by
                  asking a question.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          {qnas?.map((qna, index) => (
            <SheetTrigger
              key={index}
              className="flex w-full items-center gap-4 rounded-lg border p-4 shadow-md"
            >
              <div className="flex w-fit items-center justify-center">
                <img
                  src={qna?.user?.imageUrl ?? ""}
                  alt="user avatar"
                  className="h-12 w-12 rounded-full"
                />
              </div>
              <div className="w-full max-w-xl md:max-w-3xl lg:max-w-5xl">
                <div className="flex items-center justify-start gap-2">
                  <p className="line-clamp-1 text-start text-lg font-medium text-black/80">
                    {qna?.question}
                  </p>
                  <Badge variant="outline" className="text-xs text-black/40">
                    about {timeAgo(qna?.createdAt)}
                  </Badge>
                </div>
                <p className="line-clamp-1 text-start text-sm text-black/60">
                  {qna?.answer}
                </p>
              </div>
            </SheetTrigger>
          ))}
        </div>
      </div>
      {question && (
        <SheetContent className="sm:max-w-[80vw]">
          <SheetHeader className="flex gap-4">
            <SheetTitle className="text-xl font-bold">
              {question?.question}
            </SheetTitle>
            <MDEditor.Markdown
              source={question?.answer}
              style={{ backgroundColor: "white", color: "black" }}
            />
            <CodeReferences
              fileReferences={question?.fileReferences ?? ([] as any)}
            />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QnaPage;
