import { useState } from "react";
import type { Example, Swatch } from "../data/examples";
import { isDevanagari } from "../lib/ui";

const SWATCH_BG: Record<Swatch, string> = {
  yellow: "bg-yellow",
  pink: "bg-pink",
  blue: "bg-blue",
  green: "bg-green",
};

interface Props {
  captions: string[];
  imageUrl?: string;
  art?: Example["art"];
}

/** A meme: the real render when there is one, otherwise a drawn stand-in. */
export function MemeView({ captions, imageUrl, art }: Props) {
  const alt = `Meme: ${captions.join(" / ")}`;
  if (imageUrl) return <MemeImage key={imageUrl} src={imageUrl} alt={alt} />;
  if (art) return <DrawnMeme captions={captions} art={art} />;
  return null;
}

function MemeImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative size-full bg-white">
      {!loaded && <div className="skeleton absolute inset-0" aria-hidden />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className="size-full object-contain"
      />
    </div>
  );
}

function DrawnMeme({ captions, art }: { captions: string[]; art: Example["art"] }) {
  const Icon = art.icon;
  const [top, ...rest] = captions;
  return (
    <div
      role="img"
      aria-label={`Meme: ${captions.join(" / ")}`}
      className={`@container halftone relative size-full ${SWATCH_BG[art.swatch]}`}
    >
      <div className="absolute inset-0 grid place-items-center" aria-hidden>
        <span className="grid size-[30%] place-items-center rounded-full border-3 border-ink bg-white shadow-hard-sm">
          <Icon className="size-1/2 text-ink" strokeWidth={2.25} />
        </span>
      </div>
      <MemeLine text={top ?? ""} className="top-0" />
      <MemeLine text={rest.join(" ")} className="bottom-0" />
    </div>
  );
}

function MemeLine({ text, className }: { text: string; className: string }) {
  const hindi = isDevanagari(text);
  return (
    <p
      aria-hidden
      lang={hindi ? "hi" : undefined}
      className={`meme-text absolute inset-x-0 px-[5%] py-[4%] text-center break-words ${className} ${
        hindi
          ? "font-deva text-[11.5cqi] leading-[1.02] font-semibold"
          : "font-meme text-[8.6cqi] leading-[1.08] uppercase"
      }`}
    >
      {text}
    </p>
  );
}
