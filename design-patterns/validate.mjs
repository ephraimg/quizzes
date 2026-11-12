// Validates the question bank in data/*.js against the schema in README.md.
// Usage: node validate.mjs

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data");
const TYPES = ["mc", "multi", "tf", "match", "order", "short"];
const TAGS = [
  "what-is", "when-to-use", "structure", "inheritance-vs-composition", "interface-vs-abstract",
  "pros-cons", "compare", "spot-the-bug", "principles", "smell", "real-api", "participants", "flow", "trap",
];
const PATTERNS = [
  "strategy", "observer", "decorator", "factory-method", "abstract-factory", "singleton", "command",
  "adapter", "facade", "template-method", "iterator", "composite", "state", "proxy",
  "confusable", "principles", "smells", "jdk", "compound",
];

const errors = [];
const warnings = [];
const err = (q, msg) => errors.push(`${q.id ?? "(no id)"}: ${msg}`);
const warn = (q, msg) => warnings.push(`${q.id}: ${msg}`);

const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of fs.readdirSync(dir).filter((n) => n.endsWith(".js")).sort()) {
  try {
    vm.runInContext(fs.readFileSync(path.join(dir, f), "utf8"), sandbox, { filename: f });
  } catch (e) {
    errors.push(`${f}: does not parse: ${e.message}`);
  }
}

const questions = sandbox.window.QUIZ_QUESTIONS ?? [];
const seen = new Set();
const isStr = (s) => typeof s === "string" && s.trim().length > 0;

for (const q of questions) {
  if (!isStr(q.id)) err(q, "missing id");
  else if (seen.has(q.id)) err(q, "duplicate id");
  seen.add(q.id);
  if (!PATTERNS.includes(q.pattern)) err(q, `unknown pattern "${q.pattern}"`);
  else if (!q.id.startsWith(q.pattern + "-")) err(q, `id should start with "${q.pattern}-"`);
  if (!TYPES.includes(q.type)) err(q, `unknown type "${q.type}"`);
  if (![2, 3].includes(q.difficulty)) err(q, "difficulty must be 2 or 3");
  if (!Array.isArray(q.tags) || q.tags.length === 0) err(q, "tags required");
  else for (const t of q.tags) if (!TAGS.includes(t)) err(q, `unknown tag "${t}"`);
  if (!isStr(q.prompt)) err(q, "prompt required");
  if (q.type === "short") {
    if (q.explanation !== undefined && !isStr(q.explanation)) err(q, "explanation, if present, must be non-empty");
  } else if (!isStr(q.explanation)) err(q, "explanation required");
  else if (q.explanation.length < 80) warn(q, "explanation is very short");
  if ((q.prompt?.match(/```/g) ?? []).length % 2) err(q, "unbalanced code fence in prompt");
  // Options are shuffled at display time, so text must not refer to them by position.
  const POSITIONAL =
    /\boptions? ?\(?[0-9A-D]\b|\b(first|second|third|fourth|fifth|last|final|remaining|other|preceding) (two |three )?(options?|choices?|statements?)\b|\b(previous|earlier|above|next) question\b/i;
  for (const field of ["prompt", "explanation", "modelAnswer"]) {
    const m = typeof q[field] === "string" && q[field].match(POSITIONAL);
    if (m) err(q, `${field} refers to options by position ("${m[0]}"); quote the option's content instead`);
  }

  switch (q.type) {
    case "mc":
      if (!Array.isArray(q.options) || q.options.length < 3 || q.options.length > 5) err(q, "mc needs 3-5 options");
      else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) err(q, "mc answer must be a valid index");
      break;
    case "multi":
      if (!Array.isArray(q.options) || q.options.length < 4 || q.options.length > 6) err(q, "multi needs 4-6 options");
      else if (!Array.isArray(q.answer) || q.answer.length < 2 || q.answer.length >= q.options.length || q.answer.some((i) => !Number.isInteger(i) || i < 0 || i >= q.options.length) || new Set(q.answer).size !== q.answer.length)
        err(q, "multi answer must be 2+ distinct valid indices, not all");
      break;
    case "tf":
      if (typeof q.answer !== "boolean") err(q, "tf answer must be boolean");
      break;
    case "match":
      if (!Array.isArray(q.pairs) || q.pairs.length < 4 || q.pairs.length > 6 || q.pairs.some((p) => !Array.isArray(p) || p.length !== 2 || !isStr(p[0]) || !isStr(p[1]))) err(q, "match needs 4-6 [left, right] pairs");
      else if (new Set(q.pairs.map((p) => p[1])).size !== q.pairs.length) err(q, "match right-hand values must be unique");
      break;
    case "order":
      if (!Array.isArray(q.items) || q.items.length < 3 || new Set(q.items).size !== q.items.length) err(q, "order needs 3+ unique items");
      break;
    case "short":
      if (!isStr(q.modelAnswer)) err(q, "short needs modelAnswer");
      if (!Array.isArray(q.keyPoints) || q.keyPoints.length < 2 || q.keyPoints.length > 5) err(q, "short needs 2-5 keyPoints");
      break;
  }

  if (q.options?.some((o) => /\b(all|none) of the above\b/i.test(o))) err(q, '"all/none of the above" is not allowed');
}

// Tell checks across the set.
const mc = questions.filter((q) => q.type === "mc" && Array.isArray(q.options) && Number.isInteger(q.answer));
const longest = mc.filter((q) => q.options[q.answer].length === Math.max(...q.options.map((o) => o.length)));
if (mc.length >= 10 && longest.length / mc.length > 0.4) {
  warnings.push(`correct mc option is the longest in ${longest.length}/${mc.length} questions (${Math.round((100 * longest.length) / mc.length)}%): shorten some or lengthen distractors`);
}
const pos = {};
for (const q of mc) pos[q.answer] = (pos[q.answer] ?? 0) + 1;
const tf = questions.filter((q) => q.type === "tf");
const tfTrue = tf.filter((q) => q.answer).length;

// Report.
const byType = {};
const byPattern = {};
for (const q of questions) {
  byType[q.type] = (byType[q.type] ?? 0) + 1;
  byPattern[q.pattern] = (byPattern[q.pattern] ?? 0) + 1;
}
console.log(`${questions.length} questions`);
console.log("by type:   ", JSON.stringify(byType));
console.log("by pattern:", JSON.stringify(byPattern));
console.log("hard (3):  ", questions.filter((q) => q.difficulty === 3).length);
console.log("mc answer positions:", JSON.stringify(pos), `| tf true/false: ${tfTrue}/${tf.length - tfTrue}`);
for (const w of warnings) console.log("warn:", w);
for (const e of errors) console.log("ERROR:", e);
process.exit(errors.length ? 1 : 0);
