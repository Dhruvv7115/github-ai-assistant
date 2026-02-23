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
import { cn } from "@/lib/utils";
import {
  Bot,
  CreditCard,
  GitBranch,
  Github,
  LayoutDashboard,
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

const projects = [
  { name: "Project 1", href: "/projects/1" },
  { name: "Project 2", href: "/projects/2" },
  { name: "Project 3", href: "/projects/3" },
  { name: "Project 4", href: "/projects/4" },
  { name: "Project 5", href: "/projects/5" },
];
export default function AppSidebar() {
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
                  "flex w-full items-center transition-all duration-200 py-2",
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
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.name}>
                  <SidebarMenuButton asChild>
                    <div>
                      <div
                        className={cn(
                          "text-primary flex size-6 items-center justify-center rounded-sm border text-sm",
                          {
                            "bg-primary text-white": true,
                            // "bg-primary text-white": project.id === projectId,
                            "opacity-50": false,
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
