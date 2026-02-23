import Image from "next/image";

type Marker = {
  number: string;
  top: string;
  left: string;
};

type Circle = {
  top: string;
  left: string;
  width: string;
  height: string;
  color?: string;
  borderWidth?: number;
};

export const AnnotatedImage = ({
  src,
  alt,
  markers,
  aspectRatio,
}: {
  src: string;
  alt: string;
  markers: Marker[];
  aspectRatio?: string;
}) => (
  <div
    className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 my-6"
    style={{ aspectRatio: aspectRatio || "16/9" }}
  >
    <Image src={src} alt={alt} fill className="object-cover object-top" sizes="(max-width: 768px) 100vw, 800px" />
    {markers.map((m, i) => (
      <div
        key={i}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
        style={{ top: m.top, left: m.left }}
      >
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/90 dark:bg-slate-800/90 text-primary text-sm font-bold border border-slate-300 dark:border-slate-600 shadow-sm backdrop-blur-sm">
          {m.number}
        </span>
      </div>
    ))}
  </div>
);

export const CircledImage = ({
  src,
  alt,
  circles,
  maxWidth,
}: {
  src: string;
  alt: string;
  circles: Circle[];
  maxWidth?: string;
}) => (
  <div
    className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 my-6"
    style={{ maxWidth: maxWidth || "100%" }}
  >
    <Image src={src} alt={alt} width={1200} height={0} className="w-full h-auto" sizes="(max-width: 768px) 100vw, 800px" />
    {circles.map((c, i) => (
      <div
        key={i}
        className="absolute rounded-full z-10"
        style={{
          top: c.top,
          left: c.left,
          width: c.width,
          height: c.height,
          borderWidth: c.borderWidth || 2,
          borderStyle: "solid",
          borderColor: c.color || "#ef4444",
        }}
      />
    ))}
  </div>
);
