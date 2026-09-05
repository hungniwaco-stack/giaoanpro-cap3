"use client";

import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useAppStore } from "@/store/useAppStore";
import ActivationModal from "@/components/ActivationModal";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export default function ChatPage() {
  const { trialsLeft, isVip, useTrial } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setError(null);
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (res.status === 402) {
        setShowPaywall(true);
        setMessages(messages);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Đã có lỗi xảy ra");

      setMessages([...next, { role: "model", content: data.reply }]);
      if (!isVip) useTrial("chat");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra");
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }

  const left = trialsLeft("chat");

  return (
    <main className="flex h-screen flex-col px-6 py-8 sm:px-10 sm:py-10">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Trò Chuyện AI</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Hỏi nhanh AI về khái niệm, gợi ý hoạt động dạy học, hoặc góp ý nội dung bạn đang soạn.
      </p>

      <div
        ref={scrollRef}
        className="mt-6 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-ink/10 bg-paper-card p-6 shadow-sm"
      >
        {messages.length === 0 && (
          <p className="text-sm text-ink-muted">Bắt đầu cuộc trò chuyện — ví dụ: &quot;Gợi ý 3 hoạt động khởi động cho bài Dao động điều hòa lớp 11&quot;.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-lg rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user" ? "whitespace-pre-wrap bg-pine text-paper" : "markdown-body bg-sand text-ink"
              }`}
            >
              {m.role === "model" ? (
                <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {m.content}
                </Markdown>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-ink-muted">AI đang trả lời...</p>}
      </div>

      {error && <p className="mt-2 text-sm text-seal">{error}</p>}

      <div className="mt-4 flex items-end gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          maxLength={2000}
          rows={2}
          placeholder="Nhập câu hỏi..."
          className="flex-1 resize-none rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink placeholder:text-ink-muted/50 outline-none focus:border-pine"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="rounded-xl bg-pine px-5 py-3 font-semibold text-paper transition hover:bg-pine-dark disabled:opacity-50"
        >
          Gửi
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-ink-muted" suppressHydrationWarning>
        {isVip ? "Tài khoản VIP — dùng không giới hạn" : `Còn ${left}/3 lượt dùng thử miễn phí cho mục này`}
      </p>

      {showPaywall && <ActivationModal onClose={() => setShowPaywall(false)} />}
    </main>
  );
}
