import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const PORT = 14782; // Use non-standard port to avoid conflicts
const BASE = `http://localhost:${PORT}/api`;
const DOCS_DIR = path.join(import.meta.dirname, '..', 'docs');
const TEST_DOC = `_roundtrip-test-${Date.now()}`;
const TEST_FILE = path.join(DOCS_DIR, `${TEST_DOC}.md`);

let server;

beforeAll(async () => {
  // Start the server on a test port
  server = spawn('node', ['server/index.js', './docs'], {
    cwd: path.join(import.meta.dirname, '..'),
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'pipe',
  });

  // Wait for server to be ready
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server start timeout')), 10000);
    server.stdout.on('data', (data) => {
      if (data.toString().includes('Server running')) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.stderr.on('data', (data) => {
      console.error('Server stderr:', data.toString());
    });
  });
});

afterAll(() => {
  // Cleanup test file
  if (fs.existsSync(TEST_FILE)) {
    fs.unlinkSync(TEST_FILE);
  }
  // Kill server
  if (server) {
    server.kill('SIGTERM');
  }
});

async function putDoc(docPath, content) {
  const res = await fetch(`${BASE}/doc/${docPath}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(`PUT failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function getDoc(docPath) {
  const res = await fetch(`${BASE}/doc/${docPath}`);
  if (!res.ok) throw new Error(`GET failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── The comprehensive test document ─────────────────────────────────────────

const COMPREHENSIVE_MD = `---
ordering: 99
---
# Roundtrip Test

Normal **bold** *italic* ~~strike~~ text.

==highlighted text==

<ins>underlined text</ins>

---

:rocket: :fire: :star:

&copy; &rarr; &infin;

<!--tc:red-->red colored<!--/tc--> text

<!--tc:green-->green<!--/tc--> and <!--tc:blue-->blue<!--/tc-->

<!--blockProps:{"textColor":"red"}-->
Red paragraph

<!--blockProps:{"textAlignment":"center"}-->
Centered paragraph

<!--blockProps:{"backgroundColor":"blue"}-->
Blue background paragraph

<!--blockProps:{"textColor":"purple","textAlignment":"right"}-->
Purple right-aligned

> A blockquote

1. First item
2. Second item

- Bullet one
- Bullet two

- [x] Done task
- [ ] Pending task

<!--blockProps:{"backgroundColor":"yellow"}-->
After-list colored paragraph

| Col A | Col B |
| --- | --- |
| Cell 1 | Cell 2 |

\`\`\`javascript
function test() {
  // ==not highlight==
  // :not_emoji:
  // &not_entity;
  // <ins>not underline</ins>
  // <!--blockProps:{"nope":"nope"}-->
  // [not hidden]: #
  console.log("preserved");
}
\`\`\`

[Link text](https://example.com)

[hidden comment]: #
[another comment]: #
`;

describe('API roundtrip', () => {
  it('write → read → write → read produces stable content', async () => {
    // Step 1: Write the comprehensive document
    await putDoc(TEST_DOC, COMPREHENSIVE_MD);

    // Step 2: Read it back
    const doc1 = await getDoc(TEST_DOC);
    expect(doc1.content).toBeDefined();

    // Step 3: Write what we read back (simulating an auto-save)
    await putDoc(TEST_DOC, doc1.content);

    // Step 4: Read again — should be identical to step 2
    const doc2 = await getDoc(TEST_DOC);
    expect(doc2.content).toBe(doc1.content);
  });

  it('preserves frontmatter', async () => {
    await putDoc(TEST_DOC, COMPREHENSIVE_MD);
    const doc = await getDoc(TEST_DOC);
    expect(doc.content).toMatch(/^---\n/);
    expect(doc.content).toContain('ordering: 99');
  });

  it('preserves standard markdown', async () => {
    await putDoc(TEST_DOC, COMPREHENSIVE_MD);
    const doc = await getDoc(TEST_DOC);
    expect(doc.content).toContain('**bold**');
    expect(doc.content).toContain('*italic*');
    expect(doc.content).toContain('~~strike~~');
  });

  it('preserves highlight syntax', async () => {
    await putDoc(TEST_DOC, COMPREHENSIVE_MD);
    const doc = await getDoc(TEST_DOC);
    expect(doc.content).toContain('==highlighted text==');
  });

  it('preserves underline syntax', async () => {
    await putDoc(TEST_DOC, COMPREHENSIVE_MD);
    const doc = await getDoc(TEST_DOC);
    expect(doc.content).toContain('<ins>underlined text</ins>');
  });

  it('preserves horizontal rules', async () => {
    await putDoc(TEST_DOC, COMPREHENSIVE_MD);
    const doc = await getDoc(TEST_DOC);
    expect(doc.content).toMatch(/^---$/m);
  });

  it('preserves emoji shortcodes', async () => {
    await putDoc(TEST_DOC, COMPREHENSIVE_MD);
    const doc = await getDoc(TEST_DOC);
    expect(doc.content).toContain(':rocket:');
    expect(doc.content).toContain(':fire:');
    expect(doc.content).toContain(':star:');
  });

  it('preserves inline text color', async () => {
    await putDoc(TEST_DOC, COMPREHENSIVE_MD);
    const doc = await getDoc(TEST_DOC);
    expect(doc.content).toContain('<!--tc:red-->');
    expect(doc.content).toContain('<!--tc:green-->');
    expect(doc.content).toContain('<!--tc:blue-->');
    expect(doc.content).toContain('<!--/tc-->');
  });

  it('preserves block props', async () => {
    await putDoc(TEST_DOC, COMPREHENSIVE_MD);
    const doc = await getDoc(TEST_DOC);
    expect(doc.content).toContain('<!--blockProps:{"textColor":"red"}-->');
    expect(doc.content).toContain('<!--blockProps:{"textAlignment":"center"}-->');
    expect(doc.content).toContain('<!--blockProps:{"backgroundColor":"blue"}-->');
    // Block props after list items (regression: index mismatch when lists merge into one md part)
    expect(doc.content).toContain('<!--blockProps:{"backgroundColor":"yellow"}-->');
    expect(doc.content).toContain('After-list colored paragraph');
  });

  it('preserves code block content unchanged', async () => {
    await putDoc(TEST_DOC, COMPREHENSIVE_MD);
    const doc = await getDoc(TEST_DOC);
    expect(doc.content).toContain('// ==not highlight==');
    expect(doc.content).toContain('// :not_emoji:');
    expect(doc.content).toContain('// &not_entity;');
    expect(doc.content).toContain('// <ins>not underline</ins>');
    expect(doc.content).toContain('// <!--blockProps:{"nope":"nope"}-->');
    expect(doc.content).toContain('// [not hidden]: #');
  });

  it('preserves markdown comments', async () => {
    await putDoc(TEST_DOC, COMPREHENSIVE_MD);
    const doc = await getDoc(TEST_DOC);
    expect(doc.content).toContain('[hidden comment]: #');
    expect(doc.content).toContain('[another comment]: #');
  });

  it('preserves tables', async () => {
    await putDoc(TEST_DOC, COMPREHENSIVE_MD);
    const doc = await getDoc(TEST_DOC);
    expect(doc.content).toContain('Col A');
    expect(doc.content).toContain('Cell 1');
  });

  it('preserves task lists', async () => {
    await putDoc(TEST_DOC, COMPREHENSIVE_MD);
    const doc = await getDoc(TEST_DOC);
    expect(doc.content).toMatch(/\[x\]/);
    expect(doc.content).toMatch(/\[ \]/);
  });

  it('preserves links', async () => {
    await putDoc(TEST_DOC, COMPREHENSIVE_MD);
    const doc = await getDoc(TEST_DOC);
    expect(doc.content).toContain('[Link text](https://example.com)');
  });
});
