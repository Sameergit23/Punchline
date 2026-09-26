const GITHUB_URL = "https://github.com/";

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" className="size-[18px]" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

const link = "rounded-sm underline decoration-2 underline-offset-4 hover:decoration-yellow hover:decoration-[3px]";

export function Footer() {
  return (
    <footer className="@container container-page mt-24 pb-6 md:mt-[120px]">
      <div className="flex flex-col gap-4 border-t-3 border-ink pt-8 text-[15px] md:flex-row md:items-center md:justify-between">
        <span className="font-display text-[22px] leading-none text-ink">Punchline</span>
        <p>Built by Sameer Akhtar</p>
        <p>
          Meme templates via{" "}
          <a href="https://imgflip.com" className={link} target="_blank" rel="noreferrer">
            Imgflip
          </a>
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="btn h-10 w-fit bg-white px-3.5 text-[15px]"
        >
          <GitHubMark />
          GitHub
        </a>
      </div>

      <p
        aria-hidden
        className="mt-10 font-display text-[14.8cqi] leading-[0.8] md:text-[15.6cqi] md:tracking-[-0.03em] whitespace-nowrap text-yellow select-none [-webkit-text-stroke:6px_var(--color-ink)] [paint-order:stroke_fill] md:mt-14"
      >
        PUNCHLINE
      </p>
    </footer>
  );
}
