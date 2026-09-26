import { MessageCircle } from "lucide-react";
import { focusGenerator } from "../lib/ui";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#examples", label: "Examples" },
  { href: "#features", label: "Features" },
];

export function Logo() {
  return (
    <span className="flex items-center gap-3">
      <span className="grid size-11 -rotate-6 place-items-center rounded-[12px] border-3 border-ink bg-yellow shadow-hard-sm">
        <MessageCircle className="size-[22px] text-ink" strokeWidth={2.75} aria-hidden />
      </span>
      <span className="font-display text-[23px] leading-none text-ink min-[400px]:text-[26px]">Punchline</span>
    </span>
  );
}

export function Nav() {
  return (
    <header className="container-page">
      <nav aria-label="Main" className="flex h-[84px] items-center justify-between gap-3 md:h-[100px] md:gap-6">
        <a href="#top" aria-label="Punchline, back to top" className="rounded-md">
          <Logo />
        </a>
        <ul className="hidden items-center gap-9 text-[16px] font-medium text-ink md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-sm decoration-yellow decoration-[3px] underline-offset-[6px] hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <button type="button" className="btn h-11 bg-yellow px-3.5 text-[15px] md:h-12 md:px-5 md:text-[16px]" onClick={focusGenerator}>
          Make a meme
        </button>
      </nav>
    </header>
  );
}
