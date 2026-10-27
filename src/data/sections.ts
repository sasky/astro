// The three site sections. `path` is the URL segment: the On section lives at
// /meditations, so build links from it rather than from the section key.

export type Section = "code" | "life" | "on";

export interface SectionInfo {
  path: string;
  label: string;
  /** What a post is called in counts: "2 posts", "4 meditations". */
  unit: string;
  blurb: string;
  title: string;
  subtitle?: string;
  intro?: string;
}

export const SECTION_ORDER: Section[] = ["code", "life", "on"];

export const SECTIONS: Record<Section, SectionInfo> = {
  code: {
    path: "code",
    label: "Code",
    unit: "post",
    blurb: "Code, hosting & small games",
    title: "Code",
    // TODO(Cam): refine
    intro:
      "Notes from the day job and the weekend side projects: hosting, deploying and the odd small game. Mostly written so future me can remember how past me did it.",
  },
  life: {
    path: "life",
    label: "Life",
    unit: "post",
    blurb: "Music, family & other non-code things",
    title: "Life",
    // TODO(Cam): refine
    intro:
      "Everything that isn't code: music I can't stop playing, family, and whatever else has taken over the weekend. Expect enthusiasm, not expertise.",
  },
  on: {
    path: "meditations",
    label: "Meditations",
    unit: "meditation",
    blurb: "Satire, humour & philosophy",
    title: "Pseudo Philosophy Meditations",
    subtitle: "A Series of Essays Satirical, Humorous & Philosophical!",
    // TODO(Cam): refine
    intro:
      "Pseudo philosophy meditations, in which one takes a small, everyday thing far too seriously and follows it somewhere it probably shouldn't go. Some are satire, some are sincere, and one is not always sure which.",
  },
};
