import { EXAMPLES } from "../data/examples";
import { tilt } from "../lib/ui";
import { MemeView } from "./MemeView";

export function Examples() {
  return (
    <section id="examples" aria-labelledby="examples-title" className="container-page scroll-mt-6 pt-20 md:pt-[100px]">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <h2 id="examples-title" className="text-[38px] leading-none md:text-[56px]">
          Fresh out of the oven
        </h2>
        <p className="text-[18px] text-muted">Each one started as a single sentence.</p>
      </div>

      <ul className="mt-12 grid grid-cols-1 gap-10 md:mt-14 md:grid-cols-3 md:gap-7 xl:gap-9">
        {EXAMPLES.map((ex) => (
          <li key={ex.prompt} className="relative">
            <figure className="card tilt rounded-lg bg-white p-3.5 pb-5" style={tilt(ex.tilt)}>
              <div className="aspect-square overflow-hidden rounded-sm border-3 border-ink">
                <MemeView captions={ex.captions} imageUrl={ex.render?.imageUrl} art={ex.art} />
              </div>
              <figcaption className="mt-4 px-1">
                <span className="inline-block rounded-[6px] bg-ink px-2 py-1 text-[11px] font-bold leading-none tracking-[0.14em] text-cream">
                  PROMPT
                </span>
                <p className="mt-2 text-[17px] font-medium leading-snug text-ink">“{ex.prompt}”</p>
              </figcaption>
            </figure>
            {ex.hindi && (
              <span
                className="sticker tilt absolute -top-4 -right-2 bg-blue text-[13px] tracking-[0.1em] md:-right-4"
                style={tilt(3)}
              >
                HINDI MODE
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
