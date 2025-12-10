// services/aiService.js
import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const HF_API_KEY = process.env.HF_API_KEY || null;
const hf = HF_API_KEY ? new HfInference(HF_API_KEY) : null;

/**
 * summarizeText(text)
 * - Uses Hugging Face inference API to generate a short summary.
 * - If no HF_API_KEY present or API fails, falls back to a simple excerpt.
 */
export async function summarizeText(text, maxLength = 80) {
  if (!text || text.trim().length === 0) return "";

  // Try HF API if key present
  if (hf) {
    try {
      // Use facebook/bart-large-cnn (safe default). HF returns array or object depending on wrapper.
      const out = await hf.summarization({
        model: "facebook/bart-large-cnn",
        inputs: text,
        parameters: { max_length: maxLength, min_length: Math.max(20, Math.floor(maxLength * 0.4)) },
      });
      // out may be { summary_text: "..." } or string; handle both
      if (!out) throw new Error("Empty HF response");
      if (typeof out === "string") return out;
      if (Array.isArray(out) && out.length > 0 && out[0].summary_text) return out[0].summary_text;
      if (out.summary_text) return out.summary_text;
    } catch (e) {
      console.warn("HF summarization failed, falling back to excerpt:", e.message || e);
    }
  }

  // Fallback: pick first N chars or first 2 sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length >= 2) {
    let s = (sentences[0] + (sentences[1] || "")).trim();
    return s.length > maxLength ? s.slice(0, maxLength).trim() + "..." : s;
  }
  return text.length > maxLength ? text.slice(0, maxLength).trim() + "..." : text;
}

/**
 * extractTags(text, topK=5)
 * - Simple frequency-based keyword extraction (works offline).
 * - Removes stopwords and short words, returns `topK` candidate tags.
 * - Good as an initial 'auto-tags' feature.
 */
export function extractTags(text, topK = 5) {
  if (!text || typeof text !== "string") return [];

  // basic stopword list (extend if needed)
  const stopwords = new Set([
    "the","and","that","this","for","with","from","have","were","which","when","what",
    "where","how","why","are","but","not","you","your","will","can","was","has","had",
    "a","an","in","on","of","to","is","it","as","be","by","at","or","we","they","i",
  ]);

  // normalize, remove punctuation, split
  const words = text
    .toLowerCase()
    .replace(/[\n\r]+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.trim());

  const freq = {};
  for (const w of words) {
    if (w.length <= 3) continue; // skip short terms
    if (stopwords.has(w)) continue;
    freq[w] = (freq[w] || 0) + 1;
  }

  // sort by frequency then by length (prefer longer meaningful words)
  const candidates = Object.entries(freq)
    .sort((a,b) => {
      if (b[1] - a[1] !== 0) return b[1] - a[1];
      return b[0].length - a[0].length;
    })
    .slice(0, topK)
    .map(([w]) => w);

  return candidates;
}

