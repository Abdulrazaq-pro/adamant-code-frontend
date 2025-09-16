"use client";

import NextLink from "next/link";
import { TextGenerateEffect } from "./ui/text-generate-effect";

export const ProjectOverview = () => {
  const words = `How may I help you today?`;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Animated Text */}
      <h1 className="text-3xl font-semibold mb-4">
        <TextGenerateEffect words={words} />
      </h1>

      {/* GitHub link */}
      <p className="text-center">
        View project source on{" "}
        <Link href="https://github.com/your-username/your-repo">
          GitHub
        </Link>
        .
      </p>
    </div>
  );
};

const Link = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => {
  return (
    <NextLink
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:text-blue-600 transition-colors duration-75"
      href={href}
    >
      {children}
    </NextLink>
  );
};
