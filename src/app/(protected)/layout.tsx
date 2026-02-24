import {
  SidebarInset,
  SidebarProvider,
  Sidebar,
} from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import React from "react";
import AppSidebar from "./app-sidebar";
type Props = {
  children: React.ReactNode;
};
const SidebarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <AppSidebar />

      {/* <SidebarInset> */}
      <main className="m-2 w-full">
        <div className="border-sidebar-border bg-sidebar flex items-center gap-2 rounded-md border px-4 py-2 shadow">
          <div className="ml-auto"></div>
          <UserButton />
        </div>
        <div className="h-4"></div>
        {/* main content */}
        <div className="border-sidebar-border bg-sidebar min-h-[calc(100vh-4rem)] overflow-y-scroll rounded-md border p-4 shadow">
          {children}
        </div>
      </main>
      {/* </SidebarInset> */}
    </SidebarProvider>
  );
};

export default SidebarLayout;
