"use client";

import Markdown from "react-markdown";
import { cn } from "@/lib/utils";

interface PrdEditorProps {
  content: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MD_COMPONENTS: Record<string, any> = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="mb-4 text-2xl font-bold text-white/90">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-3 mt-6 text-lg font-semibold text-white/85">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="mb-2 mt-4 text-base font-medium text-white/80">
      {children}
    </h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-3 text-sm leading-relaxed text-white/60">{children}</p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="mb-3 list-disc pl-5 text-sm text-white/60">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="mb-3 list-decimal pl-5 text-sm text-white/60">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="mb-1">{children}</li>
  ),
  code: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <code
      className={cn(
        "rounded bg-white/10 px-1.5 py-0.5 text-xs text-indigo-300",
        className,
      )}
    >
      {children}
    </code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="mb-3 overflow-x-auto rounded-lg bg-white/5 p-3 text-xs text-white/70">
      {children}
    </pre>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="mb-3 border-l-2 border-indigo-500/40 pl-4 text-sm italic text-white/50">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-white/10" />,
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-white/80">{children}</strong>
  ),
};

export function PrdEditor({ content }: PrdEditorProps) {
  if (!content) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-sm text-white/20 italic">Dokumen kosong</p>
      </div>
    );
  }

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <Markdown components={MD_COMPONENTS}>{content}</Markdown>
    </div>
  );
}
