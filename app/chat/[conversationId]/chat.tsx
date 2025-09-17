"use client";

import { defaultModel, type modelID } from "@/aics/providers";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { Textarea } from "@/components/textarea";
import { ProjectOverview } from "@/components/project-overview";
import { Messages } from "@/components/messages";
import { Header } from "@/components/header";
import { toast } from "sonner";

export default function Chat() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel);
  const { sendMessage, messages, status, stop } = useChat({
    onError: (error) => {
      toast.error(
        error.message.length > 0
          ? error.message
          : "An error occured, please try again later.",
        { position: "top-center", richColors: true }
      );
    },
  });

  // const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="flex flex-col justify-center w-full h-dvh stretch">
      <Header />
      {messages.length === 0 ? (
        <div className="mx-auto w-full max-w-xl">
          <ProjectOverview />
        </div>
      ) : (
        <Messages messages={messages} isLoading={isLoading} status={status} />
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input }, { body: { selectedModel } });
          setInput("");
        }}
        className="px-4 pb-8 mx-auto w-full max-w-xl bg-white dark:bg-black sm:px-0"
      >
        <Textarea
          input={input}
          handleInputChange={(e) => setInput(e.currentTarget.value)} // You'll need to add this back
          isLoading={isLoading}
          status={isLoading ? "streaming" : "idle"}
          stop={() => setIsLoading(false)}
        />
      </form>
    </div>
  );
}
