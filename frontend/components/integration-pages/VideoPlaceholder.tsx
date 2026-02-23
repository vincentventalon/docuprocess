import { Play } from "lucide-react";
import Image from "next/image";

interface VideoPlaceholderProps {
  title: string;
  duration?: string;
  thumbnailUrl?: string;
}

export function VideoPlaceholder({
  title,
  duration,
  thumbnailUrl,
}: VideoPlaceholderProps) {
  return (
    <div className="relative bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden aspect-video">
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-4">
        {/* Play button */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
          <Play className="w-8 h-8 md:w-10 md:h-10 text-slate-800 ml-1" fill="currentColor" />
        </div>

        {/* Title and duration */}
        <div className="text-center px-4">
          <p className="text-white font-medium text-sm md:text-base">{title}</p>
          {duration && (
            <p className="text-white/70 text-xs md:text-sm mt-1">{duration}</p>
          )}
        </div>
      </div>

      {/* Coming soon badge */}
      <div className="absolute top-4 right-4">
        <span className="bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
