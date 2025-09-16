"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/chatStore";

export default function Chat() {
  const { conversations, fetchConversations, addMessage } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <div>
      {conversations.map((c) => (
        <div key={c.id}>
          <h2>{c.title}</h2>
          <ul>
            {c.messages.map((m) => (
              <li key={m.id}>{m.text}</li>
            ))}
          </ul>
          <button onClick={() => addMessage(c.id, "Hello from frontend!")}>
            Send Test
          </button>
        </div>
      ))}
    </div>
  );
}
