"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/use-projects";
import React from "react";
import { toast } from "sonner";

const InviteButton = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const { projectId } = useProjects();
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-500">
            Ask them to copy and paste this link
          </p>
          <Input
            className="mt-4"
            readOnly
            onClick={() => {
              navigator.clipboard.writeText(
                `${typeof window !== "undefined" ? window.location.origin : ""}/join/${projectId}`,
              );
              toast.success("Link copied to clipboard");
            }}
            value={`${window.location.origin}/join/${projectId}`}
          />
        </DialogContent>
      </Dialog>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Invite Members
      </Button>
    </>
  );
};

export default InviteButton;
