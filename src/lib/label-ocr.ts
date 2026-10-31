export function cleanRecognizedLabelText(value: string) {
  return value
    .replace(/[|]{2,}/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function readableLabelText(value: string, confidence: number) {
  if (confidence < 55) return false;
  const words = value.match(/[A-Za-zÀ-ɏ]+/g) ?? [];
  const plausible = words.filter((word) => word.length >= 3);
  const letters = (value.match(/[A-Za-zÀ-ɏ]/g) ?? []).length;
  const symbols = (value.match(/[^\sA-Za-zÀ-ɏ0-9,.;:%()\-/]/g) ?? []).length;
  return letters >= 25 && plausible.length >= 5 && plausible.length / Math.max(words.length, 1) >= 0.45 && symbols / Math.max(letters, 1) < 0.18;
}
