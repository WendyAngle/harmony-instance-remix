import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { GlobalHeader } from "./GlobalHeader";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="relative flex-1 flex flex-col min-w-0 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-indigo-50">
          <div className="pointer-events-none absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -right-32 h-[560px] w-[560px] rounded-full bg-indigo-300/30 blur-3xl" />
          <GlobalHeader />
          <main className="relative flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
