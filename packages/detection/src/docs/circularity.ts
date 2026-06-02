export interface DocSectionInput {
  readonly heading: string;
  readonly body: string;
}

export interface CircularityFlag {
  readonly sectionHeading: string;
  readonly overlappingTerms: readonly string[];
}

function extractTerms(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((term) => term.length > 3);
}

function getFirstSentence(body: string): string {
  const match = body.split(/[.!?]/)[0];
  return match ?? body;
}

function intersection(a: readonly string[], b: readonly string[]): string[] {
  const setB = new Set(b);
  return [...new Set(a.filter((term) => setB.has(term)))];
}

/** Detect heading terms repeated as opening sentence subjects. */
export function detectCircularReferences(sections: readonly DocSectionInput[]): CircularityFlag[] {
  const flags: CircularityFlag[] = [];

  for (const section of sections) {
    const headingTerms = extractTerms(section.heading);
    const openingTerms = extractTerms(getFirstSentence(section.body));
    const overlap = intersection(headingTerms, openingTerms);
    if (overlap.length > 0) {
      flags.push({ sectionHeading: section.heading, overlappingTerms: overlap });
    }
  }

  return flags;
}

/** Normalized circularity slop signal (0–1). */
export function circularityScoreValue(sections: readonly DocSectionInput[]): number {
  if (sections.length === 0) return 0;
  return detectCircularReferences(sections).length / sections.length;
}
