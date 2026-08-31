import Footer from "./Footer";

export default function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-16">
        <article className="mx-auto max-w-2xl rounded-2xl border border-ink/10 bg-paper-card p-8 text-ink-muted shadow-sm">
          <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-xs text-ink-muted/70">Cập nhật lần cuối: {updatedAt}</p>
          <div className="mt-6 space-y-4 leading-relaxed [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
