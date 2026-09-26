import { ArrowRight } from "lucide-react";
import { focusGenerator, tilt } from "../lib/ui";

export function Cta() {
  return (
    <section aria-labelledby="cta-title" className="container-page pt-24 md:pt-[120px]">
      <div className="relative">
        <div
          className="tilt rounded-cta border-3 border-ink bg-yellow px-6 pt-16 pb-14 text-center shadow-hard-xl md:px-16 md:pt-24 md:pb-20"
          style={tilt(-1)}
        >
          <h2 id="cta-title" className="text-[44px] leading-[0.98] md:text-[80px] md:leading-[0.95]">
            Your group chat
            <br />
            is waiting.
          </h2>
          <p className="mx-auto mt-6 max-w-[520px] text-[18px] text-ink md:text-[21px]">
            Type what happened. We'll do the funny part.
          </p>
          <button
            type="button"
            className="btn btn-ink btn-lg mt-10 h-16 px-8 text-[19px]"
            onClick={focusGenerator}
          >
            Make your first meme
            <ArrowRight className="size-5" strokeWidth={2.75} aria-hidden />
          </button>
        </div>

        <span
          className="sticker tilt absolute -top-5 left-5 bg-blue text-[17px] md:-top-6 md:-left-7"
          style={tilt(-2)}
        >
          No sign-up
        </span>
        <span
          className="sticker tilt absolute right-5 -bottom-5 bg-pink text-[17px] md:-right-7 md:-bottom-6"
          style={tilt(3)}
        >
          Hinglish ready
        </span>
      </div>
    </section>
  );
}
