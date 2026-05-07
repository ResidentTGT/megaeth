export const decodeNextFlight = (html: string) => {
  const chunks: string[] = [];
  const pushRegex = /self\.__next_f\.push\(\[1,"((?:\\.|[^"\\])*)"\]\)/g;

  for (const match of html.matchAll(pushRegex)) {
    const chunk = JSON.parse(`"${match[1]}"`);
    if (typeof chunk !== "string") {
      throw new Error("Next.js flight chunk is not a string");
    }

    chunks.push(chunk);
  }

  return chunks.join("");
};

export const extractJsonObject = (text: string, key: string): unknown => {
  const keyIndex = text.indexOf(`"${key}":`);
  if (keyIndex === -1) {
    throw new Error(`Cannot find "${key}" in page payload`);
  }

  const start = text.indexOf("{", keyIndex);
  if (start === -1) {
    throw new Error(`Cannot find "${key}" object start`);
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return JSON.parse(text.slice(start, index + 1));
    }
  }

  throw new Error(`Cannot find "${key}" object end`);
};

const findJsonArrayEnd = (text: string, start: number) => {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "[") depth += 1;
    if (char === "]") depth -= 1;

    if (depth === 0) {
      return index;
    }
  }

  return -1;
};

export const extractJsonArrayMatching = (
  text: string,
  matches: (value: unknown) => boolean,
  description: string
): unknown => {
  for (
    let start = text.indexOf("[");
    start !== -1;
    start = text.indexOf("[", start + 1)
  ) {
    const end = findJsonArrayEnd(text, start);
    if (end === -1) break;

    try {
      const value: unknown = JSON.parse(text.slice(start, end + 1));
      if (matches(value)) {
        return value;
      }
    } catch {
      // Flight payloads contain many bracketed fragments that are not standalone JSON.
    }
  }

  throw new Error(`Cannot find JSON array matching "${description}"`);
};

export const extractJsonArrayStartingWith = (
  text: string,
  marker: string
): unknown => {
  const markerIndex = text.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Cannot find JSON array marker "${marker}"`);
  }

  for (
    let start = text.lastIndexOf("[", markerIndex);
    start !== -1;
    start = text.lastIndexOf("[", start - 1)
  ) {
    const end = findJsonArrayEnd(text, start);
    if (end === -1) break;

    if (end >= markerIndex) {
      return JSON.parse(text.slice(start, end + 1));
    }
  }

  throw new Error(`Cannot find JSON array containing "${marker}"`);
};
