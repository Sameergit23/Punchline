import { useEffect, useRef } from "react";
import { Check, Info } from "lucide-react";
import { tilt } from "../lib/ui";
import { useGenerator } from "../lib/useGenerator";
import { GeneratorForm } from "./GeneratorForm";
import { Polaroid } from "./Polaroid";

const CHIPS = [
  { label: "Hindi + Hinglish", bg: "bg-blue", tilt: -2 },
  { label: "3 takes per prompt", bg: "bg-white", tilt: 1.5 },
  { label: "No sign-up", bg: "bg-pink", tilt: -1 },
];

export function Hero() {
  const gen = useGenerator();
  const polaroidRef = useRef<HTMLDivElement>(null);

  // Stacked layout: bring the fresh meme into view once it lands.
  const { generated, takes } = gen;
  useEffect(() => {
    if (!generated || !window.matchMedia("(max-width: 899px)").matches) return;
    polaroidRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [generated, takes]);

  return (
    <section id="make" aria-labelledby="hero-title" className="container-page scroll-mt-6 pt-6 md:pt-12">
      <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,380px)] md:gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)] xl:gap-20">
        <div>
          <p className="sticker tilt bg-pink text-[13px] tracking-[0.12em]" style={tilt(-2)}>
            AI MEME GENERATOR
          </p>
          <h1 id="hero-title" className="mt-7 text-[48px] leading-[0.98] md:text-[min(80px,6.25vw)] md:leading-[0.95]">
            Describe the moment.
            <br />
            Get the{" "}
            <span
              className="tilt inline-block rounded-md border-3 border-ink bg-yellow px-[0.14em] pb-[0.04em] shadow-hard-md"
              style={tilt(2)}
            >
              meme.
            </span>
          </h1>
          <p className="mt-7 max-w-[540px] text-[18px] leading-[1.5] md:text-[21px]">
            Type what just happened. Punchline picks the right template, writes the captions and hands you
            a meme that's ready to share.
          </p>

          <GeneratorForm gen={gen} />

          <ul className="mt-8 flex flex-wrap gap-3" aria-label="What you get">
            {CHIPS.map((chip) => (
              <li key={chip.label} className={`sticker tilt ${chip.bg} text-[15px]`} style={tilt(chip.tilt)}>
                <Check className="size-4" strokeWidth={3} aria-hidden />
                {chip.label}
              </li>
            ))}
          </ul>
        </div>

        <div ref={polaroidRef} className="scroll-mt-10 pb-6 md:pb-0">
          <Polaroid gen={gen} />
        </div>
      </div>

      <div
        role="status"
        className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        aria-live="polite"
      >
        {gen.toast && (
          <p className="sticker animate-toast bg-ink text-[15px] text-cream shadow-[4px_4px_0_0_var(--color-yellow)]">
            {gen.toast.ok ? (
              <Check className="size-4" strokeWidth={3} aria-hidden />
            ) : (
              <Info className="size-4" strokeWidth={2.5} aria-hidden />
            )}
            {gen.toast.text}
          </p>
        )}
      </div>
    </section>
  );
}
