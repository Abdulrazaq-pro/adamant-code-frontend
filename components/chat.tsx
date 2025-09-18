"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/textarea";
import { ProjectOverview } from "@/components/project-overview";
import { useChatStore } from "@/store/chatStore";
import { toast } from "sonner";
import { Header } from "./header";

export default function HomePage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    createConversation,
    setActiveConversation,
    addMessage,
    fetchMessages,
  } = useChatStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const firstMessage = input.trim();
    setInput("");

    try {
      // 1. Create conversation (wait for backend)
      const newConv = await createConversation("New Conversation");

      if (!newConv?.success || !newConv?.data?.id) {
        toast.error("Failed to create conversation");
        setIsLoading(false);
        return;
      }

      const conversationId = newConv.data.id;

      // 2. Set active and navigate FIRST (as you requested)
      setActiveConversation(conversationId);
      router.push(`/chat/${conversationId}`);

      // 3. Now send the first message and wait for backend confirmation
      const savedMsg = await addMessage(conversationId, firstMessage, true);

      // 4. Ensure messages are up-to-date in the store / UI
      //    (helps if the chat page fetched messages before addMessage finished)
      await fetchMessages(conversationId);

      // if (!(savedMsg as any)?.id) {
      //   toast.error("Failed to save message");
      // }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-dvh bg-white">
      <div className="flex flex-col w-full h-dvh overflow-y-auto flex-1 py-8">
        <div className="block md:hidden">
          <Header />
        </div>

        {/* Centered container for ProjectOverview and form */}
        <div className="flex-1 flex flex-col justify-center items-center px-4">
          <div className="w-full max-w-xl space-y-6">
            <ProjectOverview />

            <form onSubmit={handleSubmit} className="w-full">
              <Textarea
                handleInputChange={(e) => setInput(e.currentTarget.value)}
                input={input}
                isLoading={isLoading}
                status={isLoading ? "streaming" : "idle"}
                stop={() => setIsLoading(false)}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
