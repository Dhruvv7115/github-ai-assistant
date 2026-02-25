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

import React from "react";

const AskQuestionCard = () => {
  const [question, setQuestion] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOpen(true);
  };
  return (
    <>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col items-start gap-4" onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file contains the logic for the API?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Button type="submit">Ask Gitmind!</Button>
          </form>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>GitMind says {question}</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AskQuestionCard;
