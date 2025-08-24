import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@workos-inc/authkit-react";
import { api } from "convex/_generated/api";
import { Authenticated } from "convex/react";
import { GithubIcon, LinkedinIcon, MoonIcon, SunIcon } from "lucide-react";
import { Outlet, useParams } from "react-router";
import { AnonymousUser } from "~/components/auth/auth-provider";
import { NavigationProgress } from "~/components/navigation-progress";
import { useTheme } from "~/components/theme-provider";
import { SidebarHeader } from "~/components/threads-list";
import { Input } from "~/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { AnonymousThreads } from "~/routes/_shell/_components/anonymous-threads";
import { AuthenticatedThreads } from "~/routes/_shell/_components/authenticated-threads";
import { EmptyThreads } from "~/routes/_shell/_components/empty-threads";
import { SimpleThreads } from "~/routes/_shell/_components/simple-threads";

export default function ShellRoute() {
  const { user } = useAuth();
  const { threadId } = useParams();
  const { setTheme, currentTheme } = useTheme();

  // Create new thread
  const createThread = useMutation({
    mutationFn: useConvexAction(api.ai.action.createThread),
  });

  return (
    <SidebarProvider>
      <NavigationProgress />
      <Sidebar>
        {/* Use simplified threads for everyone - no complex auth handling */}
        <SimpleThreads activeThreadId={threadId} />
        <SidebarFooter>
          {currentTheme === "dark" && (
            <SidebarMenuButton onClick={() => setTheme("light")}>
              <SunIcon />
              Lights on
            </SidebarMenuButton>
          )}
          {currentTheme === "light" && (
            <SidebarMenuButton onClick={() => setTheme("dark")}>
              <MoonIcon />
              Lights off
            </SidebarMenuButton>
          )}
          <SidebarMenuButton asChild>
            <a 
              href="https://github.com/richardan01" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <GithubIcon className="h-4 w-4" />
              GitHub
            </a>
          </SidebarMenuButton>
          <SidebarMenuButton asChild>
            <a 
              href="https://www.linkedin.com/in/richieriri/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <LinkedinIcon className="h-4 w-4" />
              LinkedIn
            </a>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-hidden">
          <Outlet context={{ createThread }} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
