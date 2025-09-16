import { SimpleChat } from "~/routes/_shell.chat.$threadId/_components/simple-chat";
import { useParams } from "react-router";

export default function ChatThreadRoute() {
  const { threadId } = useParams<{ threadId: string }>();
  
  if (!threadId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-destructive">
          <h2 className="text-lg font-semibold">Invalid Chat Thread</h2>
          <p>No thread ID was provided in the URL.</p>
        </div>
      </div>
    );
  }
  
  return <SimpleChat />;
}
