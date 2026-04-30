export const decodeNextFlight = (html: string) => {
  const chunks: string[] = [];
  const pushRegex = /self\.__next_f\.push\(\[1,"((?:\\.|[^"\\])*)"\]\)/g;

  for (const match of html.matchAll(pushRegex)) {
    chunks.push(JSON.parse(`"${match[1]}"`) as string);
  }

  return chunks.join("");
};

export const extractJsonObject = <T>(text: string, key: string): T => {
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
      return JSON.parse(text.slice(start, index + 1)) as T;
    }
  }

  throw new Error(`Cannot find "${key}" object end`);
};
