"use client";

import { buildYouTubeSearchURL } from "@/lib/youtube";

interface Props {
  query: string;
  label?: string;
  className?: string;
}

export default function YouTubeButton({ query, label, className }: Props) {
  return (
    <a
      href={buildYouTubeSearchURL(query)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 active:scale-95 ${className ?? ""}`}
    >
      <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
      {label ?? "Watch on YouTube"}
    </a>
  );
}
