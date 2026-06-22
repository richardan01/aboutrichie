import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { SimpleThreadsList } from "./simple-threads-list";

interface SimpleThreadsProps {
  activeThreadId?: string;
}

interface LocalThread {
  _id: string;
  threadId: string;
  title: string;
  _creationTime: number;
}

type StoredThread = {
  threadId: string;
  title: string;
  createdAt: number;
};

export function SimpleThreads({ activeThreadId }: SimpleThreadsProps) {
  const navigate = useNavigate();
  const [localThreads, setLocalThreads] = useState<LocalThread[]>([]);

  // Get threads from database (for authenticated users)
  const { data: rawThreads = [], isLoading } = useQuery(
    convexQuery(api["chat/queries"].listThreads, {})
  );

  // Load local threads from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('chatThreads');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLocalThreads(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Failed to parse stored threads:', error);
        localStorage.removeItem('chatThreads');
      }
    }
  }, []);

  // Listen for new thread creation
  useEffect(() => {
    const handleNewThread = (event: StorageEvent) => {
      if (event.key === 'chatThreads' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          setLocalThreads(Array.isArray(parsed) ? parsed : []);
        } catch (error) {
          console.error('Failed to parse updated threads:', error);
        }
      }
    };

    // Listen for storage events from other tabs
    window.addEventListener('storage', handleNewThread);
    
    // Also listen for custom events in the same tab
    const handleCustomNewThread = () => {
      const stored = localStorage.getItem('chatThreads');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setLocalThreads(Array.isArray(parsed) ? parsed : []);
        } catch (error) {
          console.error('Failed to parse stored threads:', error);
        }
      }
    };

    window.addEventListener('localThreadsUpdated', handleCustomNewThread);
    
    return () => {
      window.removeEventListener('storage', handleNewThread);
      window.removeEventListener('localThreadsUpdated', handleCustomNewThread);
    };
  }, []);

  // Combine database threads and local threads
  const dbThreads = (rawThreads as StoredThread[]).map((thread) => ({
    _id: thread.threadId,
    title: thread.title,
    _creationTime: thread.createdAt,
    threadId: thread.threadId,
  }));

  // If we have database threads (authenticated user), use those
  // Otherwise use local threads (anonymous user)
  const threads = dbThreads.length > 0 ? dbThreads : localThreads;

  const handleThreadSelect = (selectedThreadId: string) => {
    // Find the thread to get the proper threadId
    const thread = threads.find((t) => t._id === selectedThreadId);
    if (thread) {
      navigate(`/chat/${thread.threadId}`);
    }
  };

  return (
    <SimpleThreadsList
      threads={threads}
      isLoading={isLoading}
      activeThreadId={activeThreadId}
      onThreadSelect={handleThreadSelect}
    />
  );
}
