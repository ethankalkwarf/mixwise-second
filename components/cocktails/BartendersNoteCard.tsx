import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

interface BartendersNoteCardProps {
  note: string;
  sources?: Array<{ label: string; url: string }>;
}

export function BartendersNoteCard({ note, sources }: BartendersNoteCardProps) {
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 relative overflow-hidden">
      {/* Decorative Background Icon */}
      <ChatBubbleLeftRightIcon className="absolute -top-4 -right-4 w-24 h-24 text-amber-100 -rotate-12" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-amber-600" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-amber-800">Did you know?</h3>
        </div>

        <p className="font-display italic text-lg md:text-xl text-amber-900 leading-relaxed mb-4">
          &ldquo;{note}&rdquo;
        </p>

        {sources && sources.length > 0 && (
          <div className="flex flex-wrap gap-x-2 text-xs text-amber-700/70">
            <span className="font-bold">Source:</span>
            {sources.map((source, i) => {
              // Check if URL is valid (not "#" or empty)
              const isValidUrl = source.url && source.url !== "#" && source.url.startsWith("http");

              return (
                <span key={i}>
                  {isValidUrl ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-amber-900 transition-colors"
                    >
                      {source.label}
                    </a>
                  ) : (
                    <span className="italic">{source.label}</span>
                  )}
                  {i < sources.length - 1 && ", "}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
