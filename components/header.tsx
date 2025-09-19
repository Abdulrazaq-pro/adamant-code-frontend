// import Link from "next/link";
import Link from "next/link";
import { SidebarTrigger } from "./sidebar";

export const Header = () => {
  return (
    <div className="fixed right-0 left-0 w-full top-0 bg-white md:z-[999] shadow-sm">
      <div className="flex justify-between items-center p-2">
        <Link href="/">
          <ChatbotButton />
        </Link>
        <div className="flex flex-row items-center gap-2 shrink-0 md:hidden">
          <SidebarTrigger />
        </div>
      </div>
    </div>
  );
};

const ChatbotButton = () => {
  return (
    <button className="bg-purple-900 text-white font-semibold text-[6px] w-10 h-10 rounded-xl shadow-lg">
      CHATBOT
    </button>
  );
};

// export default ChatbotButton;
