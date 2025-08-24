import { Camera, User, Database } from "lucide-react";
import * as React from "react";
import { useCallback } from "react";
import type { MetaFunction } from "react-router";
import { generatePath, useNavigate } from "react-router";
import { GithubIcon } from "~/components/icons/github";
import { Meta } from "~/components/meta";
import { Button } from "~/components/ui/button";
import { MessageInputField } from "~/components/ui/message-input-field";
import { ROUTES } from "~/lib/routes";

export const meta: MetaFunction = () => {
  return [
    { title: "Richard Ng's personal website | AI-Powered Portfolio & Chat" },
    {
      name: "description",
      content:
        "Richard Ng's personal website featuring an AI-powered chat assistant. Learn about his expertise in data products, AI/ML platforms, and enterprise analytics.",
    },
    // Open Graph
    {
      property: "og:title",
      content: "Richard Ng's personal website | AI-Powered Portfolio & Chat",
    },
    {
      property: "og:description",
      content:
        "Richard Ng's personal website featuring an AI-powered chat assistant. Learn about his expertise in data products, AI/ML platforms, and enterprise analytics.",
    },
    {
      property: "og:image",
      content: "https://developerdanwu.com/og-image.png",
    },
    { property: "og:image:alt", content: "Richard Ng's personal website preview" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Richard Ng's personal website" },
    { property: "og:url", content: "https://developerdanwu.com" },
    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: "Richard Ng's personal website | AI-Powered Portfolio & Chat",
    },
    {
      name: "twitter:description",
      content:
        "Richard Ng's personal website featuring an AI-powered chat assistant. Learn about his expertise in data products, AI/ML platforms, and enterprise analytics.",
    },
    {
      name: "twitter:image",
      content: "https://developerdanwu.com/og-image.png",
    },
  ];
};

const suggestions = [
  {
    icon: <User size={16} />,
    text: "About Richard",
    value: "about-me",
    prompt: "Tell me about yourself and your work as a Data Product Manager",
  },
  {
    icon: <Camera size={16} />,
    text: "Richard's career journey",
    value: "career-journey",
    prompt: "Can you tell me about your career progression from Technology Architect to Data Product Manager?",
  },
  {
    icon: <Database size={16} />,
    text: "Richard's key projects",
    value: "data-projects",
    prompt: "Tell me about Richard's key projects and achievements as a Senior Data Product Manager. What are some of the most impactful data and AI initiatives he's led, including the Axi Data Marketplace, churn prediction models, data modernization efforts, and enterprise analytics platforms? How do these projects showcase his expertise in building scalable data infrastructure and driving measurable business impact?",
  },
] as const;

type SubmittingSource = "message-input" | (typeof suggestions)[number]["value"];

export default function Index() {
  const [submittingSource, setSubmittingSource] = React.useState<
    SubmittingSource | undefined
  >(undefined);
  const navigate = useNavigate();
  const disabled = false; // No longer using complex thread creation

  const handleMessageSubmit = useCallback(
    async (
      message: string,
      {
        submittingSource,
      }: {
        submittingSource: SubmittingSource;
      }
    ) => {
      setSubmittingSource(submittingSource);
      
      // Generate a simple thread ID
      const threadId = `thread_${Date.now()}`;
      
      // Navigate to chat with the message
      await navigate(generatePath(ROUTES.chatThread, { threadId }));
      
      // Send the initial message via postMessage to the chat component
      setTimeout(() => {
        window.postMessage({
          type: 'INITIAL_MESSAGE',
          message: message
        }, '*');
        setSubmittingSource(undefined); // Reset loading state
      }, 100);
    },
    [navigate]
  );

  const handleSuggestionClick = (
    prompt: string,
    {
      submittingSource,
    }: {
      submittingSource: SubmittingSource;
    }
  ) => {
    handleMessageSubmit(prompt, { submittingSource });
  };

  return (
    <div className="h-full flex flex-col">
      <Meta
        titleSuffix="AI-Powered Portfolio & Chat"
        description="Richard Ng's personal website featuring an AI-powered chat assistant. Learn about his expertise in data products, AI/ML platforms, and enterprise analytics."
      />
      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold dark:text-white mb-8">
            Hi! I'm Richard 👋
          </h1>

          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <Button
                disabled={disabled}
                key={suggestion.value}
                variant="outline"
                size="sm"
                loading={submittingSource === suggestion.value}
                className="gap-2"
                onClick={() =>
                  handleSuggestionClick(suggestion.prompt, {
                    submittingSource: suggestion.value,
                  })
                }
              >
                {suggestion.icon}
                {suggestion.text}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <MessageInputField
        name="message"
        onContactMe={async () => {
          await handleMessageSubmit(
            "I'd like to contact you. How should I do that?",
            {
              submittingSource: "message-input",
            }
          );
        }}
        className="w-full max-w-3xl mx-auto"
        placeholder="Type your message..."
        onSubmit={(value) => {
          handleMessageSubmit(value.message, {
            submittingSource: "message-input",
          });
        }}
        disabled={disabled}
        isSubmitting={submittingSource === "message-input"}
      />
    </div>
  );
}
