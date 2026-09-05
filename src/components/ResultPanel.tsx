"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import StampSeal from "./StampSeal";

export default function ResultPanel({
  title,
  markdown,
  onDownloadDocx,
  onDownloadPptx,
  locked,
}: {
  title: string;
  markdown: string;
  onDownloadDocx: () => void;
  onDownloadPptx: () => void;
  locked?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            onClick={onDownloadPptx}
            title={locked ? "Nâng cấp để xuất không giới hạn" : undefined}
            className="rounded-lg border border-ink/15 px-3 py-1.5 text-ink-muted hover:bg-sand"
          >
            {locked ? "🔒 Tải PPT" : "Tải PPT"}
          </button>
          <button
            onClick={onDownloadDocx}
            title={locked ? "Nâng cấp để xuất không giới hạn" : undefined}
            className="rounded-lg bg-pine px-3 py-1.5 font-medium text-paper hover:bg-pine-dark"
          >
            {locked ? "🔒 Nâng cấp để tải Word" : "Tải Word"}
          </button>
        </div>
      </div>

      <div className="flex items-start gap-4 px-5 py-5">
        <StampSeal />
        <div className="markdown-body max-h-96 max-w-[720px] flex-1 overflow-auto text-sm text-ink-muted">
          <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
        </div>
      </div>
    </div>
  );
}
