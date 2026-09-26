import { Bug, IndianRupee, Wifi, type LucideIcon } from "lucide-react";

export type Swatch = "yellow" | "pink" | "blue" | "green";

export interface Example {
  prompt: string;
  captions: string[];
  /** Drawn stand-in, shown until `render` is filled in. */
  art: { swatch: Swatch; icon: LucideIcon };
  /** The real Imgflip render, from a take generated for this prompt. */
  render?: { imageUrl: string; templateId: string };
  hindi?: boolean;
  tilt: number;
}

// Each render is the pick of three takes the app generated for its prompt.
export const EXAMPLES: Example[] = [
  {
    prompt: "fixing one 'tiny' bug before lunch",
    captions: ["1:30 PM ka chill lunch plan", "1:28 pe chheda hua tiny bug"],
    art: { swatch: "green", icon: Bug },
    render: { imageUrl: "https://i.imgflip.com/b22fs6.jpg", templateId: "247113703" },
    tilt: -2,
  },
  {
    prompt: "asking for the WiFi password at a relative's house",
    captions: ["मेहमान को WiFi पासवर्ड देना", "25 पत्ते उठाना"],
    art: { swatch: "blue", icon: Wifi },
    render: { imageUrl: "https://i.imgflip.com/b22fsm.jpg", templateId: "217743513" },
    hindi: true,
    tilt: 1.5,
  },
  {
    prompt: "relatives asking about my package",
    captions: ["Relatives: beta kitna package laga?", "Main jiska joining letter abhi tak nahi aaya"],
    art: { swatch: "pink", icon: IndianRupee },
    render: { imageUrl: "https://i.imgflip.com/b22g4n.jpg", templateId: "148909805" },
    tilt: -1,
  },
];
