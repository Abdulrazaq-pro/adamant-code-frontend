"use client";

import { defaultModel, type modelID } from "@/ai/providers";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "./textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ProjectOverview } from "./project-overview";

// Message type definition
type Message = {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: Date;
};

export default function Chat() {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  // useEffect(() => {
  //   if (textareaRef.current) {
  //     textareaRef.current.style.height = "auto";
  //     textareaRef.current.style.height =
  //       textareaRef.current.scrollHeight + "px";
  //   }
  // }, [input]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const addMessage = (sender: "ai" | "user", text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message immediately
    addMessage("user", userMessage);
    setIsLoading(true);

    try {
      // Simulate AI response
      setTimeout(() => {
        addMessage(
          "ai",
          `I received your message: "${userMessage}". This is a simulated response. In a real implementation, this would be replaced with your actual AI API call.`
        );
        setIsLoading(false);
      }, 1200);
    } catch (error) {
      toast.error("Failed to send message");
      setIsLoading(false);
    }
  };

  // Check if we have any user messages
  const hasUserMessages = messages.some((msg) => msg.sender === "user");

  return (
    <div className="flex flex-col w-full h-dvh">
      {/* Messages Display - Only show when there are user messages */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: hasUserMessages ? "auto" : 0,
          opacity: hasUserMessages ? 1 : 0,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="flex-1 overflow-y-auto px-4 py-6 mx-auto w-full max-w-xl overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ display: hasUserMessages ? "block" : "none" }}
      >
        <div className="space-y-4">
          {messages.map((message) => {
            const isUser = message.sender === "user";

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex items-end gap-2 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {/* Bot avatar (before bubble) */}
                {!isUser && (
                  <img
                    src="/bot.png"
                    alt="Bot"
                    className="w-6 h-6 rounded-full block"
                  />
                )}

                {/* Message bubble */}
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    isUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* User avatar (after bubble) */}
                {isUser && (
                  <img
                    src="/user.png"
                    alt="You"
                    className="w-6 h-6 rounded-full block"
                  />
                )}
              </motion.div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg max-w-[80%]">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </motion.div>

      {/* Input Form - Centered initially, then slides to bottom */}
      <motion.div
        initial={false}
        animate={{
          justifyContent: hasUserMessages ? "flex-end" : "center",
          alignItems: hasUserMessages ? "flex-end" : "center",
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`flex flex-col ${hasUserMessages ? "" : "flex-1"}`}
      >
        {messages.length === 0 ? (
          <div className="mx-auto w-full max-w-xl">
            <ProjectOverview />
          </div>
        ) : (
          <div>...</div>
        )}
        <form
          onSubmit={handleSubmit}
          className="px-4 pb-8 mx-auto w-full max-w-xl bg-white dark:bg-black sm:px-0"
        >
          <Textarea
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            handleInputChange={(e) => setInput(e.currentTarget.value)}
            input={input}
            isLoading={isLoading}
            status={isLoading ? "streaming" : "idle"}
            stop={() => setIsLoading(false)}
          />
        </form>
      </motion.div>
    </div>
  );
}
