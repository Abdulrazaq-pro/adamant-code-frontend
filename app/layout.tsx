"use client";

import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  // SidebarTrigger,
  SidebarHeader,
} from "@/components/sidebar";
import ChatSidebar from "@/layout/ChatSidebar";
import { Header } from "@/components/header";
import { useChatStore } from "@/store/chatStore";
import Loader from "@/components/Loader";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Vercel x DeepInfra Chatbot",
//   description:
//     "This starter project uses DeepInfra with the AI SDK via the Vercel Marketplace",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {
    conversations,
    // fetchConversations,
    // fetchMessages,
    // addMessage,
    // setActiveConversation,
    generalLoading,
    conversationLoading,
  } = useChatStore();
  return (
    <html lang="en">
      <body className={` antialiased`}>
        {/* <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > */}
        <SidebarProvider className="">
          <div className="hidden md:block">
            <Header />
          </div>
          <Sidebar className="overflow-y-auto flex-1 py-16 space-y-4 h-full bg-purple-100">
            <SidebarHeader>
              <div className="flex items-center justify-between w-full"></div>
            </SidebarHeader>
            {/* <SidebarHeader></SidebarHeader> */}
            {conversations ? (
              <ChatSidebar />
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <Loader />
              </div>
            )}
          </Sidebar>
          <SidebarInset>
            <div className="">{children}</div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
