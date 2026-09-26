import { Clapperboard, DoorOpen, Languages, Layers, Link2, PencilLine } from "lucide-react";
import { tilt } from "../lib/ui";

const FEATURES = [
  {
    icon: Layers,
    title: "Three takes every time",
    body: <>Get three different memes per prompt and keep the one that lands.</>,
  },
  {
    icon: Languages,
    title: "Hindi + Hinglish",
    body: (
      <>
        Captions in Roman Hinglish or proper <span lang="hi">हिंदी</span>, the way your group chat talks.
      </>
    ),
  },
  {
    icon: PencilLine,
    title: "Edit before you share",
    body: <>Every caption is editable, so the final joke is yours.</>,
  },
  {
    icon: Clapperboard,
    title: "Desi + global templates",
    body: <>Bollywood and TV classics plus the internet's favourites.</>,
  },
  {
    icon: Link2,
    title: "One-click links",
    body: <>Copy a link and drop it in any chat.</>,
  },
  {
    icon: DoorOpen,
    title: "No sign-up",
    body: <>Open it, type, laugh. That's the whole onboarding.</>,
  },
];

const TILE_BG = ["bg-yellow", "bg-pink", "bg-blue"];
const TILTS = [-1.5, 1, -0.5, 1.5, -1, 0.5];

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="container-page scroll-mt-6 pt-20 md:pt-[100px]">
      <h2 id="features-title" className="text-[38px] leading-none md:text-[56px]">
        Built for the group chat
      </h2>

      <ul className="mt-12 grid grid-cols-1 gap-7 md:mt-14 md:grid-cols-3 xl:gap-8">
        {FEATURES.map((f, i) => (
          <li
            key={f.title}
            className="card tilt rounded-lg bg-white p-7 shadow-hard-md"
            style={tilt(TILTS[i])}
          >
            <span
              className={`grid size-14 place-items-center rounded-md border-3 border-ink shadow-hard-sm ${TILE_BG[i % 3]}`}
            >
              <f.icon className="size-7 text-ink" strokeWidth={2.25} aria-hidden />
            </span>
            <h3 className="mt-6 text-[22px] leading-tight">{f.title}</h3>
            <p className="mt-2 text-[16.5px] leading-[1.55]">{f.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
