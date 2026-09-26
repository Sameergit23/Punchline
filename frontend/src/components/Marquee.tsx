import { Fragment } from "react";

const PHRASES = ["DESCRIBE IT", "AI PICKS THE TEMPLATE", "TWEAK IT", "SEND IT"];
const SPARKS = ["text-yellow", "text-pink", "text-blue", "text-green"];

/** Each half of the track repeats the phrases twice so it's wider than any screen. */
function Run() {
  return (
    <div className="flex shrink-0 items-center">
      {[0, 1].map((round) => (
        <Fragment key={round}>
          {PHRASES.map((phrase, i) => (
            <Fragment key={phrase}>
              <span className="px-7">{phrase}</span>
              <span className={SPARKS[i]}>✦</span>
            </Fragment>
          ))}
        </Fragment>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="mt-20 overflow-x-clip md:mt-[100px]">
      <p className="sr-only">Describe it, AI picks the template, tweak it, send it.</p>
      <div
        aria-hidden
        className="-ml-10 w-[calc(100%+80px)] -rotate-[1.5deg] overflow-hidden bg-ink py-4 font-display text-[22px] leading-none text-cream md:py-5 md:text-[26px]"
      >
        <div className="flex w-max animate-marquee motion-reduce:animate-none">
          <Run />
          <Run />
        </div>
      </div>
    </div>
  );
}
