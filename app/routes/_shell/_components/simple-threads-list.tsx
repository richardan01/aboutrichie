import { useConvexAction } from "@convex-dev/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { SidebarHeader as SidebarHeaderOriginal } from "~/components/ui/sidebar";
import { useDialogStore } from "~/lib/dialog-store";
import { ROUTES } from "~/lib/routes";
import { cn } from "~/lib/utils";
import { EmptyThreads } from "./empty-threads";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { IconButton } from "~/components/ui/icon-button";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

export interface SimpleThread {
  _id: string;
  threadId: string;
  title: string;
  _creationTime: number;
}

function SidebarHeader({ children }: { children: React.ReactNode }) {
  return (
    <SidebarHeaderOriginal>
      <div className="flex items-center justify-between my-2">
        <div className="text-lg font-semibold">RichardGPT</div>
        <IconButton asChild variant="ghost" size="sm">
          <Link to={ROUTES.home}>
            <Plus />
          </Link>
        </IconButton>
      </div>
      {children}
    </SidebarHeaderOriginal>
  );
}

function SimpleThreadItem({
  thread,
  onThreadSelect,
  activeThreadId,
}: {
  thread: SimpleThread;
  onThreadSelect: (threadId: string) => void;
  activeThreadId: string | undefined;
}) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogStore = useDialogStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const deleteConversationAction = useConvexAction(api["chat/actions"].deleteConversation);
  const deleteThread = useMutation({
    mutationKey: ["delete-simple-thread", thread._id],
    onMutate: async ({ threadId }: { threadId: string }) => {
      if (threadId === activeThreadId) {
        await navigate(ROUTES.home);
      }
    },
    onSuccess: async () => {
      toast.success("Thread deleted");
      dialogStore.trigger.closeAlertDialog();
      // Invalidate the threads list query to refresh the UI
      await queryClient.invalidateQueries({
        queryKey: ["convex", api["chat/queries"].listThreads, {}],
      });
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error("Failed to delete thread");
    },
    mutationFn: async ({ threadId }: { threadId: string }) => {
      return await deleteConversationAction({ threadId });
    },
  });

  const handleDelete = () => {
    dialogStore.trigger.openAlertDialog({
      title: "Delete thread",
      disableCloseOnConfirm: true,
      description: "Are you sure you want to delete this thread?",
      confirmButtonMutationKeys: [["delete-simple-thread", thread._id]],
      onConfirm: () => {
        deleteThread.mutate({
          threadId: thread.threadId,
        });
      },
    });
  };

  return (
    <SidebarMenuItem key={thread._id} className="w-full flex">
      <ContextMenu onOpenChange={setMenuOpen}>
        <ContextMenuTrigger asChild>
          <SidebarMenuButton
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onThreadSelect(thread._id)}
            isActive={activeThreadId === thread.threadId}
            className={cn(
              "justify-start group/item w-0 h-10 flex-[1_1_0px] flex text-sm truncate text-left",
              menuOpen && "bg-muted"
            )}
          >
            <span className="font-medium w-0 flex-[1_1_0px] text-sm truncate block text-left">
              {thread.title}
            </span>

            {hovered && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                asChild
                variant="ghost"
                size="sm"
              >
                <button>
                  <Trash />
                </button>
              </IconButton>
            )}
          </SidebarMenuButton>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuItem
              onSelect={() => {
                handleDelete();
              }}
              variant="destructive"
            >
              Delete thread
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
    </SidebarMenuItem>
  );
}

export function SimpleThreadsList({
  threads,
  isLoading,
  activeThreadId,
  onThreadSelect,
}: {
  threads: SimpleThread[];
  isLoading: boolean;
  activeThreadId?: string;
  onThreadSelect: (threadId: string) => void;
}) {
  return (
    <>
      <SidebarHeader>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {isLoading ? (
                <div className="flex justify-center items-center text-center text-muted-foreground">
                  <LoadingSpinner />
                </div>
              ) : null}

              {threads.map((thread) => (
                <SimpleThreadItem
                  key={thread._id}
                  thread={thread}
                  onThreadSelect={onThreadSelect}
                  activeThreadId={activeThreadId}
                />
              ))}

              {!isLoading && threads.length === 0 && <EmptyThreads />}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}