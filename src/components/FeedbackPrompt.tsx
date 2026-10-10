"use client";

import { useState } from "react";
import { FEEDBACK_OPTIONS, FEEDBACK_TEXT_MAX, type FeedbackOptionId } from "@/lib/feedback";

export default function FeedbackPrompt({ context }: { context: string }) {
  const [choice, setChoice] = useState<FeedbackOptionId | null>(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function send() {
    if (!choice) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option: choice, text, ctx: context }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-4 rounded-2xl border border-ink/10 bg-paper-card px-5 py-4 text-sm text-ink-muted">
        Cảm ơn bạn đã góp ý — chúng tôi sẽ dùng nó để cải thiện giáo án.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-ink/10 bg-paper-card px-5 py-4">
      <p className="text-sm font-medium text-ink">Giáo án này có đúng ý bạn không?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {FEEDBACK_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setChoice(o.id)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition ${
              choice === o.id
                ? "border-pine bg-pine text-paper"
                : "border-ink/15 text-ink-muted hover:bg-sand"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {choice && (
        <div className="mt-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={FEEDBACK_TEXT_MAX}
            rows={2}
            placeholder="Bạn muốn nói thêm điều gì? (không bắt buộc)"
            className="w-full resize-none rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 outline-none focus:border-pine"
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={send}
              disabled={status === "sending"}
              className="rounded-lg bg-pine px-4 py-1.5 text-sm font-medium text-paper hover:bg-pine-dark disabled:opacity-50"
            >
              {status === "sending" ? "Đang gửi..." : "Gửi góp ý"}
            </button>
            {status === "error" && <span className="text-sm text-seal">Chưa gửi được, bạn thử lại nhé.</span>}
          </div>
        </div>
      )}
    </div>
  );
}
