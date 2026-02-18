export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateDuration(wordCount: number, wpm: number): number {
  if (wpm <= 0) return 0;
  return Math.round((wordCount / wpm) * 60);
}
