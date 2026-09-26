import { Cta } from "./components/Cta";
import { Examples } from "./components/Examples";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { Marquee } from "./components/Marquee";
import { Nav } from "./components/Nav";

export default function App() {
  return (
    <>
      <a
        href="#make"
        className="sr-only z-50 rounded-md border-3 border-ink bg-yellow px-4 py-2 font-bold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to the meme generator
      </a>
      <div id="top" />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <HowItWorks />
        <Examples />
        <Features />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
