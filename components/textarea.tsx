import { Input } from "@/components/ui/input";

interface InputProps {
  input: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  status: string;
  stop?: () => void;
}

export const Textarea = ({
  input,
  handleInputChange,
  isLoading,
  status,
  stop,
}: InputProps) => {
  return (
    <div className="relative w-full pt-4">
      <Input
        className="bg-secondary w-full rounded-2xl pr-12 h-12"
        value={input}
        autoFocus
        placeholder="Say something..."
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !isLoading) {
              const form = (e.target as HTMLElement).closest("form");
              if (form) (form as HTMLFormElement).requestSubmit();
            }
          }
        }}
      />

      {status === "streaming" || status === "submitted" ? (
        <button
          type="button"
          onClick={stop}
          className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <div className="animate-spin w-4 h-4">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </button>
      ) : (
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-400 hover:bg-zinc-800 disabled:bg-zinc-300 disabled:dark:bg-zinc-700 dark:disabled:opacity-80 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <img src="/icons/send.png" alt="Send" className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};