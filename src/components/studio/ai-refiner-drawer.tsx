"use client";

import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import {
  Send,
  X,
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { parsePrdToNodeTree } from "@/lib/parsers/prd-to-nodes";
import type { IntentType, RefineProposal } from "@/app/api/generate/refine/route";

// ─── Message types ─────────────────────────────────────────────────

interface BaseMessage {
  role: "user" | "assistant";
  content: string;
}

interface AssistantMessage extends BaseMessage {
  role: "assistant";
  intent?: IntentType;
  proposals?: RefineProposal[];
  pendingChanges?: {
    prdContent?: string;
    tasksContent?: string;
    applied: boolean;
  };
}

type Message = BaseMessage | AssistantMessage;

function isAssistant(msg: Message): msg is AssistantMessage {
  return msg.role === "assistant";
}

// ─── Markdown components for chat ──────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CHAT_MD: Record<string, any> = {
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-2 last:mb-0">{children}</p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="space-y-2 text-[15px] text-[#c9d1d9] ml-4 leading-relaxed list-disc">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="space-y-2 text-[15px] text-[#c9d1d9] ml-4 leading-relaxed list-decimal">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-bold text-[#f0f6fc]">{children}</strong>
  ),
  em: ({ children }: { children: React.ReactNode }) => (
    <em className="italic text-[#8b949e]">{children}</em>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code className="font-mono text-[13px] bg-[#161b22] text-[#e6edf3] px-1.5 py-0.5 rounded border border-[#30363d]">
      {children}
    </code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="mb-2 overflow-x-auto font-mono text-[13px] bg-[#161b22] text-[#e6edf3] p-3 rounded-md border border-[#30363d] leading-normal">
      {children}
    </pre>
  ),
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="font-sans font-bold text-[#f0f6fc] tracking-tight text-lg mb-2">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="font-sans font-bold text-[#f0f6fc] tracking-tight text-base mt-3 mb-2">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="font-sans font-bold text-[#f0f6fc] tracking-tight text-sm mt-2 mb-1">{children}</h3>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="mb-2 border-l-[3px] border-[#30363d] pl-3 text-[13px] italic text-[#8b949e]">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-[#21262d]" />,
};

// ─── Props ─────────────────────────────────────────────────────────

interface AiRefinerDrawerProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onRefined: (payload: {
    prdContent?: string;
    tasksContent?: string;
    agentsContent?: string;
    nodeTree?: string;
  }) => void;
  prdContent?: string;
  tasksContent?: string;
  agentsContent?: string;
  nodeTree?: string;
}

// ─── Component ─────────────────────────────────────────────────────

export function AiRefinerDrawer({
  projectId,
  open,
  onClose,
  onRefined,
  prdContent,
  tasksContent,
  agentsContent,
  nodeTree,
}: AiRefinerDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        'Halo! Saya AI Refiner. Ketik instruksi untuk memodifikasi PRD/TASKS, atau ajukan pertanyaan tentang proyek Anda. Contoh: *"Tambahkan integrasi Payment Gateway"*, *"Simplifikasi section deployment"*, atau *"Bagaimana cara menghandle rate limiting?"*.',
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Send message to API ──
  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          instruction: text,
          action: "preview",
          prdContent: prdContent ?? "",
          tasksContent: tasksContent ?? "",
          nodeTree: nodeTree ?? "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.error}` } as AssistantMessage,
        ]);
        return;
      }

      const assistantMsg: AssistantMessage = {
        role: "assistant",
        content: data.message ?? "Selesai.",
        intent: data.intent,
      };

      if (data.intent === "ADVISORY" && Array.isArray(data.proposals)) {
        assistantMsg.proposals = data.proposals;
      }

      if (data.intent === "MUTATION" && (data.updatedPrd || data.updatedTasks)) {
        assistantMsg.pendingChanges = {
          prdContent: data.updatedPrd,
          tasksContent: data.updatedTasks,
          applied: false,
        };
      }

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Gagal menghubungi AI. Coba lagi." } as AssistantMessage,
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── Apply MUTATION changes to DB ──
  const handleApply = async (msgIndex: number) => {
    const msg = messages[msgIndex];
    if (!isAssistant(msg) || !msg.pendingChanges || msg.pendingChanges.applied)
      return;

    setApplying(true);
    try {
      // Derive agentsContent from updated PRD (server will regenerate anyway,
      // but we optimistically compute it here for the parent callback)
      const updatedPrd = msg.pendingChanges.prdContent;

      // Parse nodeTree from updated PRD sections 4 & 5
      const parsedNodeTree = updatedPrd ? parsePrdToNodeTree(updatedPrd) : null;

      const res = await fetch("/api/generate/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          action: "apply",
          applyPayload: {
            prdContent: msg.pendingChanges.prdContent,
            tasksContent: msg.pendingChanges.tasksContent,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Gagal menyimpan: ${data.error}` } as AssistantMessage,
        ]);
        return;
      }

      // Mark as applied
      setMessages((prev) =>
        prev.map((m, i) =>
          i === msgIndex && isAssistant(m) && m.pendingChanges
            ? { ...m, pendingChanges: { ...m.pendingChanges, applied: true } }
            : m,
        ),
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Perubahan berhasil diterapkan ke database!",
        } as AssistantMessage,
      ]);

      // Notify parent to refresh all content
      onRefined({
        prdContent: msg.pendingChanges.prdContent,
        tasksContent: msg.pendingChanges.tasksContent,
        agentsContent: data.agentsContent,
        nodeTree: parsedNodeTree ? JSON.stringify(parsedNodeTree) : undefined,
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Gagal menyimpan perubahan. Coba lagi." } as AssistantMessage,
      ]);
    } finally {
      setApplying(false);
    }
  };

  // ── Discard MUTATION changes ──
  const handleDiscard = (msgIndex: number) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === msgIndex && isAssistant(m) && m.pendingChanges
          ? { ...m, pendingChanges: { ...m.pendingChanges, applied: true } }
          : m,
      ),
    );
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Perubahan dibatalkan." } as AssistantMessage,
    ]);
  };

  // ── Click a proposal button → send its actionPrompt as user message ──
  const handleProposalClick = (proposal: RefineProposal) => {
    handleSend(proposal.actionPrompt);
  };

  if (!open) return null;

  return (
    <div className="flex h-full w-[480px] shrink-0 flex-col border-l border-white/10 bg-slate-950/90 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-medium text-white/80">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          AI Refiner
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-white/40 transition-colors hover:text-white/80"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i}>
              {/* Chat bubble */}
              <div
                className={cn(
                  "rounded-xl px-3 py-2 text-[15px] leading-relaxed space-y-3",
                  msg.role === "user"
                    ? "ml-8 bg-[#1f6feb]/20 text-[#c9d1d9]"
                    : "mr-4 border border-[#30363d] bg-[#161b22] font-sans text-[#c9d1d9]",
                )}
              >
                {msg.role === "assistant" ? (
                  <div className="space-y-3">
                    <Markdown components={CHAT_MD}>{msg.content}</Markdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>

              {/* ADVISORY: proposal action buttons */}
              {isAssistant(msg) &&
                msg.intent === "ADVISORY" &&
                msg.proposals &&
                msg.proposals.length > 0 && (
                  <div className="mr-4 mt-2 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1 text-[11px] text-purple-400/70">
                      <Lightbulb className="h-3 w-3" />
                      Saran yang bisa dieksekusi:
                    </div>
                    {msg.proposals.map((p, pi) => (
                      <button
                        key={pi}
                        onClick={() => handleProposalClick(p)}
                        disabled={loading}
                        className="rounded-md border border-purple-500/30 bg-purple-900/40 px-3 py-1.5 text-left text-xs font-medium text-purple-200 transition-colors hover:bg-purple-800/60 disabled:opacity-50"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}

              {/* MUTATION: apply/discard confirmation card */}
              {isAssistant(msg) &&
                msg.pendingChanges &&
                !msg.pendingChanges.applied && (
                  <div className="mr-4 mt-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Perubahan menunggu konfirmasi
                    </div>
                    <p className="mb-3 text-xs text-white/40">
                      AI mengusulkan perubahan pada dokumen proyek. Tekan{" "}
                      <b>Terapkan</b> untuk menyimpan, atau <b>Batal</b> untuk
                      mengabaikan.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApply(i)}
                        disabled={applying}
                        className="h-7 flex-1 gap-1.5 text-xs"
                      >
                        {applying ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                        Terapkan
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDiscard(i)}
                        disabled={applying}
                        className="h-7 flex-1 text-xs"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                )}

              {/* Applied badge */}
              {isAssistant(msg) && msg.pendingChanges?.applied && (
                <div className="mr-4 mt-1.5 flex items-center gap-1 text-xs text-emerald-400/70">
                  <Check className="h-3 w-3" />
                  Diterapkan
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="mr-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/40">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Memproses...
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Instruksi / pertanyaan..."
            className="h-9 flex-1 rounded-lg border border-[#30363d] bg-[#0d1117] px-3 text-[15px] text-[#c9d1d9] outline-none placeholder:text-[#484f58] focus:border-[#1f6feb]"
            disabled={loading}
          />
          <Button
            size="sm"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="h-9 px-3"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
