export function PrototypeNote({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`border border-[#d9a04b]/40 bg-[#fff5d9] text-[#6d4b15] ${
        compact
          ? "rounded-xl px-4 py-2 text-xs leading-5"
          : "rounded-2xl px-5 py-4 text-sm leading-6"
      }`}
      role="note"
    >
      <strong>Independent proof of concept.</strong> Not an official Carle
      Illinois application, not clinically validated, and not for medical use.
      All participant data is fictional.
    </div>
  );
}
