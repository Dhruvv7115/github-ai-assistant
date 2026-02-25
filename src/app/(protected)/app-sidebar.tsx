"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useProjects } from "@/hooks/use-projects";
import { useRefetch } from "@/hooks/use-refetch";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  Bot,
  CreditCard,
  GitBranch,
  Github,
  LayoutDashboard,
  Loader2,
  Plus,
  Presentation,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Q&A", href: "/qna", icon: Bot },
  { title: "Meetings", href: "/meetings", icon: Presentation },
  { title: "Billings", href: "/billings", icon: CreditCard },
];

export default function AppSidebar() {
  const { projects, isLoading, projectId, setProjectId } = useProjects();
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader
        className={cn("flex w-full flex-row items-center", {
          "justify-start gap-2": open,
          "justify-center gap-0": !open,
        })}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <div
                className={cn(
                  "flex w-full items-center py-2 transition-all duration-200",
                  {
                    "justify-start gap-2": open,
                    "justify-center": !open,
                  },
                )}
              >
                <div className="bg-primary rounded-md p-1.5 text-white">
                  <Github />
                </div>
                {open && (
                  <h1 className="text-primary/80 text-xl font-bold">GitMind</h1>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.href}
                      className={cn({
                        "bg-primary text-white": pathname === item.href,
                      })}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {isLoading &&
                new Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <SidebarMenuItem
                      key={i}
                      className="flex h-6 animate-pulse items-center gap-2 rounded bg-black/10"
                    ></SidebarMenuItem>
                  ))}
              {projects.length === 0 && !isLoading && <p>No projects</p>}{" "}
              {projects.length > 0 &&
                !isLoading &&
                projects.map((project) => (
                  <SidebarMenuItem key={project.name}>
                    <SidebarMenuButton asChild className="cursor-pointer">
                      <div onClick={() => setProjectId(project.id)}>
                        <div
                          className={cn(
                            "text-primary flex size-6 items-center justify-center rounded-sm border text-sm",
                            {
                              "bg-primary text-white": project.id === projectId,
                            },
                          )}
                        >
                          {project.name[0]}
                        </div>
                        <span>{project.name}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              {open && (
                <SidebarMenuItem>
                  <Button variant="outline" size="sm">
                    <Link
                      href="/create-project"
                      className="flex items-center justify-center gap-1 tracking-tight"
                    >
                      <Plus />
                      Create Project
                    </Link>
                  </Button>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
