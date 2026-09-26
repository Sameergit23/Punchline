import { PencilLine, Send, WandSparkles } from "lucide-react";
import { tilt } from "../lib/ui";

const STEPS = [
  {
    title: "Describe it",
    body: "Type the situation in plain words. The more specific, the funnier.",
    icon: PencilLine,
    bg: "bg-yellow",
    tilt: -2,
  },
  {
    title: "AI picks the template",
    body: "It matches your moment to a desi or global template and writes captions that fit.",
    icon: WandSparkles,
    bg: "bg-pink",
    tilt: 1.5,
  },
  {
    title: "Tweak and share",
    body: "Edit any line, try another take, or copy the link and send it.",
    icon: Send,
    bg: "bg-blue",
    tilt: -1,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="container-page scroll-mt-6 pt-20 md:pt-[100px]">
      <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
        <h2 id="how-title" className="text-[38px] leading-none md:text-[56px]">
          How it works
        </h2>
        <p className="sticker tilt bg-white text-[16px] md:text-[18px]" style={tilt(2)}>
          Three steps. Zero design skills.
        </p>
      </div>

      <ol className="mt-12 grid grid-cols-1 gap-8 md:mt-14 md:grid-cols-3 md:gap-7 xl:gap-9">
        {STEPS.map((step, i) => (
          <li key={step.title} className={`card tilt ${step.bg} p-7`} style={tilt(step.tilt)}>
            <div className="flex items-start justify-between">
              <span className="font-display text-[64px] leading-[0.8] text-ink" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="grid size-14 place-items-center rounded-md border-3 border-ink bg-white shadow-hard-sm">
                <step.icon className="size-7 text-ink" strokeWidth={2.25} aria-hidden />
              </span>
            </div>
            <h3 className="mt-9 text-[25px] leading-tight">{step.title}</h3>
            <p className="mt-2.5 text-[17px] leading-[1.5]">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
