import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

export async function parseTxt(file: File): Promise<string> {
  return file.text();
}

export async function parsePdf(file: File): Promise<{ text: string; warning?: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item): item is TextItem => 'str' in item)
      .map((item) => item.str)
      .join(' ');
    pages.push(pageText);
  }
  const text = pages.join('\n\n');
  const warning =
    text.trim().length < 10
      ? 'This PDF may be scanned or image-based — text could not be extracted.'
      : undefined;
  return { text, warning };
}

export async function parseJson(file: File): Promise<string> {
  const raw = await file.text();
  const parsed: unknown = JSON.parse(raw);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;
    for (const key of ['text', 'script', 'content']) {
      if (typeof obj[key] === 'string') return obj[key] as string;
    }
  }
  return JSON.stringify(parsed, null, 2);
}

export function parseClipboard(text: string): string {
  return text.trim();
}

export async function parseFile(file: File): Promise<{ text: string; warning?: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('File is too large. Please use a file smaller than 20MB.');
  }
  if (ext === 'txt' || file.type === 'text/plain') {
    return { text: await parseTxt(file) };
  }
  if (ext === 'pdf' || file.type === 'application/pdf') {
    return parsePdf(file);
  }
  if (ext === 'json' || file.type === 'application/json') {
    return { text: await parseJson(file) };
  }
  throw new Error('Unsupported file type. Please use TXT, PDF, or JSON.');
}
