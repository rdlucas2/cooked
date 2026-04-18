import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { getLabelQuery, FOOD_101_LABELS } from "./food101Labels";

export interface Prediction {
  label: string;
  query: string;
  confidence: number;
}

let model: mobilenet.MobileNet | null = null;

export async function loadModel(): Promise<void> {
  if (model) return;
  await tf.ready();
  model = await mobilenet.load({ version: 2, alpha: 1.0 });
}

// Maps MobileNet class names to the nearest Food-101 equivalent by keyword match.
function mapToFood101(className: string): string {
  const lower = className.toLowerCase().replace(/[,]/g, "");
  for (const label of FOOD_101_LABELS) {
    const query = getLabelQuery(label);
    if (lower.includes(query) || query.includes(lower)) return label;
  }
  // Check each word in the class name against each label word
  const words = lower.split(/[\s_]+/);
  for (const label of FOOD_101_LABELS) {
    const labelWords = label.split("_");
    if (words.some((w) => labelWords.includes(w) && w.length > 3)) return label;
  }
  return lower.replace(/\s+/g, "_");
}

export async function classifyImage(
  imgElement: HTMLImageElement | HTMLCanvasElement
): Promise<Prediction[]> {
  if (!model) await loadModel();
  const predictions = await model!.classify(imgElement, 10);

  // Deduplicate by mapped label, keep highest confidence per label
  const seen = new Set<string>();
  const results: Prediction[] = [];

  for (const p of predictions) {
    const label = mapToFood101(p.className);
    if (!seen.has(label)) {
      seen.add(label);
      results.push({
        label,
        query: getLabelQuery(label),
        confidence: p.probability,
      });
    }
    if (results.length === 3) break;
  }

  return results;
}
