"use client";

import Markdown from "react-markdown";
import { cn } from "@/lib/utils";

interface PrdEditorProps {
  content: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MD_COMPONENTS: Record<string, any> = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="font-sans font-bold text-[#f0f6fc] tracking-tight text-2xl mb-4">
      {children}
    </h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="font-sans font-bold text-[#f0f6fc] tracking-tight text-xl mt-6 mb-3">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="font-sans font-bold text-[#f0f6fc] tracking-tight text-lg mt-4 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-[15px] leading-relaxed text-[#c9d1d9] space-y-3 mb-4">
      {children}
    </p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="space-y-2 text-[15px] text-[#c9d1d9] ml-5 leading-relaxed list-disc">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="space-y-2 text-[15px] text-[#c9d1d9] ml-5 leading-relaxed list-decimal">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
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
        "font-mono text-[13px] bg-[#161b22] text-[#e6edf3] px-1.5 py-0.5 rounded border border-[#30363d]",
        className,
      )}
    >
      {children}
    </code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="font-mono text-[13px] bg-[#161b22] text-[#e6edf3] p-3 rounded-md border border-[#30363d] overflow-x-auto leading-normal mb-4">
      {children}
    </pre>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-[3px] border-[#30363d] pl-4 text-[15px] italic text-[#8b949e] mb-4">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-[#21262d]" />,
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-bold text-[#f0f6fc]">{children}</strong>
  ),
  table: ({ children }: { children: React.ReactNode }) => (
    <table className="w-full border-collapse text-[15px] mb-4">{children}</table>
  ),
  thead: ({ children }: { children: React.ReactNode }) => (
    <thead>{children}</thead>
  ),
  tbody: ({ children }: { children: React.ReactNode }) => (
    <tbody>{children}</tbody>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="bg-[#161b22] text-[#f0f6fc] p-3 text-left border border-[#30363d] font-semibold text-[13px] uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="p-3 border border-[#30363d] text-[#c9d1d9] leading-normal">
      {children}
    </td>
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
