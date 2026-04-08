export type StudentIdCardExtractedFields = {
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  gender?: "male" | "female" | "other";
  state?: string;
  dateOfBirth?: string;
};

export type AdvisorIdCardExtractedFields = {
  fullName?: string;
  gender?: "male" | "female" | "other";
  collegeEmail?: string;
  branch?: string;
  mobileNumber?: string;
  state?: string;
  dateOfBirth?: string;
  rollNumber?: string;
};

function normalizeText(input: string): string {
  return input
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/[|]/g, ":")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function correctOcrErrors(text: string): string {
  // Keep this conservative: normalize separators/spacing only.
  // Field-level functions handle OCR character fixes safely.
  return text
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[|]/g, ":")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function normalizedForMatch(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findLabeledValue(text: string, labels: string[]): string | undefined {
  const lines = text
    .split(/\n+/)
    .map((x) => x.trim())
    .filter(Boolean);
  const normalizedLabels = labels.map((x) => normalizedForMatch(x));

  for (const line of lines) {
    const lineNorm = normalizedForMatch(line);
    if (!normalizedLabels.some((label) => lineNorm.includes(label))) continue;
    const direct = line.split(/[:\-]/).slice(1).join(" ").trim();
    if (direct) return direct;
    const stripped = line.replace(/^[A-Za-z .()#]+\s*/g, "").trim();
    if (stripped) return stripped;
  }
  return undefined;
}

async function recognizeTextFromFile(file: File): Promise<string> {
  const { recognize } = await import("tesseract.js");
  const result = await recognize(file, "eng", {
    logger: () => {
      /* no-op */
    },
  });
  const text = normalizeText(result.data.text || "");
  // Apply OCR correction immediately after recognition
  return correctOcrErrors(text);
}

async function recognizeMerged(frontFile: File, backFile: File): Promise<string> {
  const [front, back] = await Promise.all([
    recognizeTextFromFile(frontFile),
    recognizeTextFromFile(backFile),
  ]);
  const merged = normalizeText(`${front}\n${back}`);
  return correctOcrErrors(merged);
}

function readFirstMatch(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const m = text.match(pattern);
    const v = m?.[1]?.trim();
    if (v) return v;
  }
  return undefined;
}

function findEmail(text: string): string | undefined {
  const compact = text.replace(/\s*@\s*/g, "@").replace(/\s*\.\s*/g, ".");
  return readFirstMatch(compact, [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i]);
}

function findPhone(text: string): string | undefined {
  const noSpaces = text.replace(/\s+/g, "");
  const m = noSpaces.match(/(?:\+?91)?([6-9]\d{9})/);
  if (m?.[1]) return m[1];
  const anyTen = noSpaces.match(/(\d{10})/);
  return anyTen?.[1];
}

function findGender(text: string): "male" | "female" | "other" | undefined {
  const labeled = findLabeledValue(text, ["gender", "sex"]);
  if (labeled) {
    const lv = labeled.toLowerCase();
    if (lv.includes("male") || lv === "m") return "male";
    if (lv.includes("female") || lv === "f") return "female";
    if (lv.includes("other")) return "other";
  }
  const m = text.match(/\b(male|female|other|m|f)\b/i)?.[1]?.toLowerCase();
  if (!m) return undefined;
  if (m === "m" || m === "male") return "male";
  if (m === "f" || m === "female") return "female";
  return "other";
}

function titleCaseWords(value: string): string {
  let cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  
  return cleaned
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function findState(text: string, states: string[]): string | undefined {
  const lower = text.toLowerCase();
  for (const s of states) {
    if (lower.includes(s.toLowerCase())) return s;
  }
  return undefined;
}

function looksLikeName(raw: string): boolean {
  let cleaned = raw;
  // Correct only common OCR digit-letter swaps in name-like tokens.
  cleaned = cleaned
    .replace(/\b0(?=[A-Za-z])/g, "O")
    .replace(/\b1(?=[A-Za-z])/g, "I")
    .replace(/\b5(?=[A-Za-z])/g, "S")
    .replace(/\b8(?=[A-Za-z])/g, "B");
  cleaned = cleaned.replace(/[^A-Za-z .'\-]/g, "");
  cleaned = cleaned.trim();
  
  if (cleaned.length < 3 || cleaned.length > 60) return false;
  const words = cleaned.split(/\s+/).filter(Boolean);
  // Require 2+ words where most are 2+ chars (not just initials)
  if (words.length < 2) return false;
  const validWords = words.filter((w) => w.length >= 2);
  // At least 2 valid words (not single letters)
  return validWords.length >= 2 || (words.length === 2 && validWords.length >= 1);
}

function findFullName(text: string): string | undefined {
  // Try label-based extraction only (most reliable)
  const fromLabel = findLabeledValue(text, [
    "full name",
    "name of student",
    "name of advisor",
    "student name",
    "name",
  ]);
  if (fromLabel && looksLikeName(fromLabel)) {
    const cleaned = fromLabel
      .replace(/\b0(?=[A-Za-z])/g, "O")
      .replace(/\b1(?=[A-Za-z])/g, "I")
      .replace(/\b5(?=[A-Za-z])/g, "S")
      .replace(/\b8(?=[A-Za-z])/g, "B")
      .replace(/[^A-Za-z .'\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return titleCaseWords(cleaned);
  }

  const labeled = readFirstMatch(text, [
    /(?:full\s*name|name\s*of\s*student|name\s*of\s*advisor|student\s*name|name)\s*[:=\-]\s*([A-Za-z .]{4,60})/i,
  ]);
  if (labeled && looksLikeName(labeled)) {
    const cleaned = labeled
      .replace(/\b0(?=[A-Za-z])/g, "O")
      .replace(/\b1(?=[A-Za-z])/g, "I")
      .replace(/\b5(?=[A-Za-z])/g, "S")
      .replace(/\b8(?=[A-Za-z])/g, "B")
      .replace(/[^A-Za-z .'\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return titleCaseWords(cleaned);
  }

  // Disable unreliable fallback extraction to prevent garbage matches
  return undefined;
}

function findBranch(text: string): string | undefined {
  const BRANCH_KEYWORDS = /(engineering|comput|science|technology|electrical|mechanical|civil|electronics|information|mathematics|chemical|biotech|aerospace|data|ai|it|cse|ece|eee)/i;

  const normalizeBranchValue = (raw: string): string | undefined => {
    let v = raw.replace(/[|]/g, " ").replace(/\s+/g, " ").trim();

    // Remove obvious non-branch parts commonly present in programme lines.
    v = v.replace(/\b(b\.?\s*tech|m\.?\s*tech|b\.?\s*e\.?|be|bsc|b\.sc|msc|m\.sc|mba|bca|mca|diploma)\b/gi, " ");
    v = v.replace(/\b(batch|session)\b\s*[:\-]?\s*(19|20)\d{2}(\s*[-/]\s*(19|20)\d{2})?/gi, " ");
    v = v.replace(/\b(19|20)\d{2}\b/g, " ");
    v = v.replace(/\b(programme|program|course|of)\b/gi, " ");

    // Stop at other field labels if OCR glued multiple fields together.
    v = v.split(/\b(name|father|mother|mobile|address|blood|dob|roll|id|college|email|phone)\b/i)[0]?.trim() ?? "";

    // Keep only branch-safe characters.
    v = v.replace(/[^A-Za-z&()\-/. ]/g, " ").replace(/\s+/g, " ").trim();
    if (!v) return undefined;

    // If line still has many words, keep likely specialization tail.
    const words = v.split(" ").filter(Boolean);
    if (words.length > 7) {
      const tail = words.slice(-4).join(" ");
      if (BRANCH_KEYWORDS.test(tail)) v = tail;
    }

    if (v.length < 3 || v.length > 50) return undefined;
    if (/\d/.test(v)) return undefined;
    if (!BRANCH_KEYWORDS.test(v)) return undefined;

    return v;
  };

  const lines = text
    .split(/\n+/)
    .map((x) => x.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (!/\b(branch|department|dept|programme|program|course|specialization|stream)\b/i.test(line)) {
      continue;
    }

    // Prefer text after explicit separators.
    const rhs = line.includes(":")
      ? line.split(":").slice(1).join(":").trim()
      : line.includes("=")
        ? line.split("=").slice(1).join("=").trim()
        : line.replace(/^.*\b(branch|department|dept|programme|program|course|specialization|stream)\b/i, "").trim();

    const cleaned = normalizeBranchValue(rhs || line);
    if (cleaned) return cleaned;
  }

  return undefined;
}

function findDateOfBirth(text: string): string | undefined {
  const fromLabel = findLabeledValue(text, ["dob", "date of birth"]);
  if (fromLabel) {
    const m = fromLabel.match(/[0-3]?\d[\/\-.][01]?\d[\/\-.](?:19|20)?\d{2}/);
    if (m?.[0]) return m[0];
  }
  return readFirstMatch(text, [
    /(?:dob|date\s*of\s*birth)\s*[:\-]?\s*([0-3]?\d[\/\-.][01]?\d[\/\-.](?:19|20)?\d{2})/i,
  ]);
}

function findRollNumber(text: string): string | undefined {
  const fromLabel = findLabeledValue(text, [
    "roll no",
    "roll number",
    "roll#",
    "enrollment no",
    "registration no",
  ]);
  if (fromLabel) {
    const compact = fromLabel.replace(/\s+/g, "");
    if (compact.length >= 4) return compact;
  }
  return readFirstMatch(text, [
    /(?:roll(?:\s*no|\s*number|#)?|enrollment(?:\s*no|\s*number)?|registration(?:\s*no|\s*number)?)\s*[:\-]?\s*([A-Za-z0-9\/-]{4,40})/i,
  ]);
}

export async function extractStudentFieldsFromIdCard(
  frontFile: File,
  backFile: File,
  states: string[],
): Promise<StudentIdCardExtractedFields> {
  const text = await recognizeMerged(frontFile, backFile);
  return {
    fullName: findFullName(text),
    email: findEmail(text),
    mobileNumber: findPhone(text),
    dateOfBirth: findDateOfBirth(text),
    gender: findGender(text),
    state: findState(text, states),
  };
}

export async function extractAdvisorFieldsFromIdCard(
  frontFile: File,
  backFile: File,
  states: string[],
): Promise<AdvisorIdCardExtractedFields> {
  const text = await recognizeMerged(frontFile, backFile);
  const email = findEmail(text);
  return {
    fullName: findFullName(text),
    gender: findGender(text),
    collegeEmail: email,
    branch: findBranch(text),
    mobileNumber: findPhone(text),
    state: findState(text, states),
    dateOfBirth: findDateOfBirth(text),
    rollNumber: findRollNumber(text),
  };
}
