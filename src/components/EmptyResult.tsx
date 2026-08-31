export default function EmptyResult({ text }: { text: string }) {
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-paper-card/60 px-6 text-center">
      <span className="font-display text-3xl text-pine">✎</span>
      <p className="mt-3 max-w-xs text-sm text-ink-muted">{text}</p>
    </div>
  );
}
