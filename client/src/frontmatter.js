const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function parseFrontmatter(content) {
  const match = content.match(FRONTMATTER_REGEX);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const raw = match[1];
  const frontmatter = {};

  for (const line of raw.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      value = Number(value);
    }
    frontmatter[key] = value;
  }

  const body = content.slice(match[0].length);
  return { frontmatter, body };
}

export function serializeFrontmatter(frontmatter, body) {
  const keys = Object.keys(frontmatter);
  if (keys.length === 0) return body;

  const lines = keys.map((k) => `${k}: ${frontmatter[k]}`);
  return `---\n${lines.join('\n')}\n---\n${body}`;
}
