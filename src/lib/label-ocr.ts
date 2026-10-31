export function cleanRecognizedLabelText(value: string) {
  return value
    .replace(/[|]{2,}/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function readableLabelText(value: string, confidence: number) {
  if (confidence < 65) return false;
  const words = value.match(/[A-Za-zÀ-ɏ]+/g) ?? [];
  const plausible = words.filter((word) => word.length >= 3);
  const vowelWords = plausible.filter((word) => /[aeiouyà-ÿ]/i.test(word));
  const letters = (value.match(/[A-Za-zÀ-ɏ]/g) ?? []).length;
  const symbols = (value.match(/[^\sA-Za-zÀ-ɏ0-9,.;:%()\-/]/g) ?? []).length;
  const usefulCharacters = (value.match(/[A-Za-zÀ-ɏ0-9,.;:%()\-/]/g) ?? []).length;
  const nonWhitespace = (value.match(/\S/g) ?? []).length;
  return letters >= 35
    && plausible.length >= 6
    && plausible.length / Math.max(words.length, 1) >= 0.6
    && vowelWords.length / Math.max(plausible.length, 1) >= 0.65
    && symbols / Math.max(letters, 1) < 0.1
    && usefulCharacters / Math.max(nonWhitespace, 1) >= 0.9;
}
