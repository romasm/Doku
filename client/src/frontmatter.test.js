import { describe, it, expect } from 'vitest';
import { parseFrontmatter, serializeFrontmatter } from './frontmatter';

describe('parseFrontmatter', () => {
  it('parses frontmatter with ordering', () => {
    const content = '---\nordering: 5\n---\n# Title\n\nBody';
    const { frontmatter, body } = parseFrontmatter(content);
    expect(frontmatter.ordering).toBe(5);
    expect(body).toBe('# Title\n\nBody');
  });

  it('parses multiple fields', () => {
    const content = '---\nordering: 1\ntitle: Hello\n---\nBody';
    const { frontmatter } = parseFrontmatter(content);
    expect(frontmatter.ordering).toBe(1);
    expect(frontmatter.title).toBe('Hello');
  });

  it('returns empty frontmatter when none present', () => {
    const content = '# Just a heading\n\nBody text';
    const { frontmatter, body } = parseFrontmatter(content);
    expect(frontmatter).toEqual({});
    expect(body).toBe(content);
  });

  it('parses numeric values as numbers', () => {
    const content = '---\ncount: 42\nprice: 9.99\n---\nBody';
    const { frontmatter } = parseFrontmatter(content);
    expect(frontmatter.count).toBe(42);
    expect(frontmatter.price).toBe(9.99);
  });

  it('keeps non-numeric values as strings', () => {
    const content = '---\nname: Hello World\n---\nBody';
    const { frontmatter } = parseFrontmatter(content);
    expect(frontmatter.name).toBe('Hello World');
  });

  it('handles Windows line endings', () => {
    const content = '---\r\nordering: 1\r\n---\r\n# Title';
    const { frontmatter, body } = parseFrontmatter(content);
    expect(frontmatter.ordering).toBe(1);
    expect(body).toBe('# Title');
  });
});

describe('serializeFrontmatter', () => {
  it('serializes frontmatter with body', () => {
    const result = serializeFrontmatter({ ordering: 1 }, '# Title\n\nBody');
    expect(result).toBe('---\nordering: 1\n---\n# Title\n\nBody');
  });

  it('returns body only when frontmatter is empty', () => {
    const result = serializeFrontmatter({}, '# Title');
    expect(result).toBe('# Title');
  });

  it('serializes multiple fields', () => {
    const result = serializeFrontmatter({ ordering: 3, title: 'Test' }, 'Body');
    expect(result).toContain('ordering: 3');
    expect(result).toContain('title: Test');
  });
});

describe('frontmatter roundtrip', () => {
  it('parse → serialize → parse produces same result', () => {
    const original = '---\nordering: 5\n---\n# My Document\n\nContent here.';
    const { frontmatter, body } = parseFrontmatter(original);
    const serialized = serializeFrontmatter(frontmatter, body);
    const { frontmatter: fm2, body: body2 } = parseFrontmatter(serialized);
    expect(fm2).toEqual(frontmatter);
    expect(body2).toBe(body);
  });

  it('roundtrips content without frontmatter', () => {
    const original = '# No Frontmatter\n\nJust body.';
    const { frontmatter, body } = parseFrontmatter(original);
    const serialized = serializeFrontmatter(frontmatter, body);
    expect(serialized).toBe(original);
  });
});
