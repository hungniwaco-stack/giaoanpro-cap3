"use client";

import StampSeal from "./StampSeal";

export default function ResultPanel({
  title,
  markdown,
  onDownloadDocx,
  onDownloadPptx,
}: {
  title: string;
  markdown: string;
  onDownloadDocx: () => void;
  onDownloadPptx: () => void;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            onClick={onDownloadPptx}
            className="rounded-lg border border-ink/15 px-3 py-1.5 text-ink-muted hover:bg-sand"
          >
            Tải PPT
          </button>
          <button
            onClick={onDownloadDocx}
            className="rounded-lg bg-pine px-3 py-1.5 font-medium text-paper hover:bg-pine-dark"
          >
            Tải Word
          </button>
        </div>
      </div>

      <div className="flex items-start gap-4 px-5 py-5">
        <StampSeal />
        <pre className="max-h-96 flex-1 overflow-auto whitespace-pre-wrap font-sans text-sm text-ink-muted">
          {markdown}
        </pre>
      </div>
    </div>
  );
}
