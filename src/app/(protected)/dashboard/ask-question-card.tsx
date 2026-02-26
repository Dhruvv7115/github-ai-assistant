import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import MdEditor from "@uiw/react-md-editor";

import React from "react";
import { useProjects } from "@/hooks/use-projects";
import { api } from "@/trpc/react";
import { CodeReferences } from "./code-references";
import { Download, Github } from "lucide-react";
import { toast } from "sonner";
import { useRefetch } from "@/hooks/use-refetch";

const AskQuestionCard = () => {
  const { projectId } = useProjects();
  const [question, setQuestion] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [response, setResponse] = React.useState("");
  const saveAnswer = api.project.saveQuestion.useMutation();
  const [fileReferences, setFileReferences] = React.useState<
    {
      fileName: string;
      sourceCode: string;
      summary: string;
    }[]
  >([]);
  const [streaming, setStreaming] = React.useState(false);
  const refetch = useRefetch();

  api.project.askQuestion.useSubscription(
    {
      question,
      projectId,
    },
    {
      enabled: streaming,
      onData(value) {
        if (value.type === "files") {
          setFileReferences(value.data);
        } else if (value.type === "text") {
          setResponse((prev) => prev + value.data);
        }
        setOpen(true);
      },
      onComplete() {
        setStreaming(false);
      },
      onError(err) {
        console.error("Stream error:", err);
        setStreaming(false);
      },
    },
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResponse("");
    setFileReferences([]);
    setStreaming(true);
  };
  return (
    <>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question...</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col items-start gap-4" onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file contains the logic for the API?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Button type="submit" disabled={streaming}>
              Ask Gitmind!
            </Button>
          </form>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader className="flex flex-row items-center justify-start gap-4">
            <DialogTitle>
              <div className="bg-primary rounded-md p-1.5 text-white">
                <Github />
              </div>
            </DialogTitle>
            <Button
              variant="outline"
              onClick={() => {
                saveAnswer.mutate(
                  {
                    question,
                    answer: response,
                    fileReferences,
                    projectId,
                  },
                  {
                    onSuccess: () => {
                      toast.success("Answer saved successfully");
                      refetch();
                    },
                    onError: () => {
                      toast.error("Something went wrong");
                    },
                  },
                );
              }}
              disabled={saveAnswer.isPending}
              className="cursor-pointer"
            >
              <Download />
              Save Answer
            </Button>
          </DialogHeader>
          <main className="flex w-full flex-col items-center justify-center gap-4 border px-4">
            <MdEditor.Markdown
              source={response}
              style={{ backgroundColor: "white", color: "black" }}
              className="h-full max-h-[30vh] w-full overflow-scroll rounded-lg bg-white p-4 text-wrap text-neutral-700"
            />

            <CodeReferences fileReferences={fileReferences} />
            <Button
              onClick={() => setOpen(false)}
              className="w-full cursor-pointer"
            >
              Close
            </Button>
          </main>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AskQuestionCard;
