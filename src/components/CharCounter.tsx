export default function CharCounter({ length, max }: { length: number; max: number }) {
  return (
    <p className={`mt-1 text-right text-xs ${length > max * 0.95 ? "text-seal" : "text-ink-muted/60"}`}>
      {length}/{max} ký tự
    </p>
  );
}
