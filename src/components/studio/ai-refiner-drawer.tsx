"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Sparkles, Loader2, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiRefinerDrawerProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onRefined: (newContent: string) => void;
}

export function AiRefinerDrawer({
  projectId,
  open,
  onClose,
  onRefined,
}: AiRefinerDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        'Halo! Saya AI Refiner. Ketik instruksi untuk memodifikasi PRD — contoh: *"Tambahkan integrasi Payment Gateway"* atau *"Simplifikasi section deployment"*.',
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, instruction: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.error}` },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `PRD berhasil diperbarui! ${data.content.length} karakter. Silakan cek tab PRD Editor.`,
        },
      ]);

      // Notify parent to refresh PRD content
      onRefined(data.content);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Gagal menghubungi AI. Coba lagi." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => onRefined("")} // toggle via parent
        className={cn(
          "fixed right-4 top-1/2 z-50 -translate-y-1/2 rounded-l-xl border border-r-0 border-white/10 bg-indigo-500/20 p-2.5 text-indigo-300 backdrop-blur-md transition-colors hover:bg-indigo-500/30",
        )}
        title="AI Refiner"
      >
        <PanelRightOpen className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="flex h-full w-80 flex-col border-l border-white/10 bg-slate-950/90 backdrop-blur-xl">
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
            <div
              key={i}
              className={cn(
                "rounded-xl px-3 py-2 text-sm leading-relaxed",
                msg.role === "user"
                  ? "ml-8 bg-indigo-500/20 text-white/80"
                  : "mr-4 border border-white/10 bg-white/5 text-white/60",
              )}
            >
              {msg.content}
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
            placeholder="Instruksi penyesuaian..."
            className="h-9 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/80 outline-none placeholder:text-white/30 focus:border-indigo-500/50"
            disabled={loading}
          />
          <Button
            size="sm"
            onClick={handleSend}
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
