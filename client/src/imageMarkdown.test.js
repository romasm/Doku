import { describe, it, expect } from 'vitest';
import { preprocessMarkdown, restoreBlockProps } from './imageMarkdown';

// ── Marker constants (must match imageMarkdown.js internals) ────────────────

const HR_PLACEHOLDER = '\u2500\u2500\u2500';
const HIGHLIGHT_OPEN = '\uFFF0HL\uFFF0';
const HIGHLIGHT_CLOSE = '\uFFF0/HL\uFFF0';
const UNDERLINE_OPEN = '\uFFF0UL\uFFF0';
const UNDERLINE_CLOSE = '\uFFF0/UL\uFFF0';
const COLOR_CLOSE = '\uFFF0/TC\uFFF0';
const BLOCK_META_MARKER = '\uFFF0BP\uFFF0';

function makeColorOpen(color) { return `\uFFF0TC:${color}\uFFF0`; }

// ── Helper ──────────────────────────────────────────────────────────────────

function preprocess(md) {
  return preprocessMarkdown(md);
}

// ── Standard markdown (should pass through unchanged) ───────────────────────

describe('preprocessMarkdown: standard markdown passthrough', () => {
  it('preserves bold', () => {
    const { processed } = preprocess('This is **bold** text.');
    expect(processed).toContain('**bold**');
  });

  it('preserves italic', () => {
    const { processed } = preprocess('This is *italic* text.');
    expect(processed).toContain('*italic*');
  });

  it('preserves strikethrough', () => {
    const { processed } = preprocess('This is ~~struck~~ text.');
    expect(processed).toContain('~~struck~~');
  });

  it('preserves inline code', () => {
    const { processed } = preprocess('Use `console.log()` here.');
    expect(processed).toContain('`console.log()`');
  });

  it('preserves links', () => {
    const { processed } = preprocess('[click](https://example.com)');
    expect(processed).toContain('[click](https://example.com)');
  });

  it('preserves images', () => {
    const { processed } = preprocess('![alt](image.png)');
    expect(processed).toContain('![alt](image.png)');
  });

  it('preserves blockquotes', () => {
    const { processed } = preprocess('> This is a quote.');
    expect(processed).toContain('> This is a quote.');
  });

  it('preserves ordered lists', () => {
    const { processed } = preprocess('1. First\n2. Second');
    expect(processed).toContain('1. First');
    expect(processed).toContain('2. Second');
  });

  it('preserves headings', () => {
    const { processed } = preprocess('## Heading Two');
    expect(processed).toContain('## Heading Two');
  });
});

// ── Highlight ==text== ──────────────────────────────────────────────────────

describe('preprocessMarkdown: highlight', () => {
  it('converts ==text== to marker tokens', () => {
    const { processed } = preprocess('This is ==highlighted== text.');
    expect(processed).toContain(HIGHLIGHT_OPEN + 'highlighted' + HIGHLIGHT_CLOSE);
    expect(processed).not.toContain('==highlighted==');
  });

  it('handles multiple highlights', () => {
    const { processed } = preprocess('==one== and ==two==');
    expect(processed).toContain(HIGHLIGHT_OPEN + 'one' + HIGHLIGHT_CLOSE);
    expect(processed).toContain(HIGHLIGHT_OPEN + 'two' + HIGHLIGHT_CLOSE);
  });
});

// ── Underline <ins> ─────────────────────────────────────────────────────────

describe('preprocessMarkdown: underline', () => {
  it('converts <ins>text</ins> to marker tokens', () => {
    const { processed } = preprocess('This is <ins>underlined</ins> text.');
    expect(processed).toContain(UNDERLINE_OPEN + 'underlined' + UNDERLINE_CLOSE);
    expect(processed).not.toContain('<ins>');
  });

  it('is case-insensitive', () => {
    const { processed } = preprocess('<INS>test</INS>');
    expect(processed).toContain(UNDERLINE_OPEN + 'test' + UNDERLINE_CLOSE);
  });
});

// ── Horizontal rules ────────────────────────────────────────────────────────

describe('preprocessMarkdown: horizontal rules', () => {
  it('converts --- to placeholder', () => {
    const { processed } = preprocess('above\n\n---\n\nbelow');
    expect(processed).toContain(HR_PLACEHOLDER);
    expect(processed).not.toMatch(/^---$/m);
  });

  it('converts *** to placeholder', () => {
    const { processed } = preprocess('above\n\n***\n\nbelow');
    expect(processed).toContain(HR_PLACEHOLDER);
  });

  it('converts ___ to placeholder', () => {
    const { processed } = preprocess('above\n\n___\n\nbelow');
    expect(processed).toContain(HR_PLACEHOLDER);
  });

  it('does not convert --- inside text', () => {
    const { processed } = preprocess('some---text');
    expect(processed).not.toContain(HR_PLACEHOLDER);
    expect(processed).toContain('some---text');
  });
});

// ── Emoji shortcodes ────────────────────────────────────────────────────────

describe('preprocessMarkdown: emoji shortcodes', () => {
  it('converts :rocket: to unicode', () => {
    const { processed } = preprocess(':rocket:');
    expect(processed).toBe('\u{1F680}');
  });

  it('converts :heart: to unicode', () => {
    const { processed } = preprocess(':heart:');
    expect(processed).toBe('\u2764\uFE0F');
  });

  it('converts :+1: to unicode', () => {
    const { processed } = preprocess(':+1:');
    expect(processed).toBe('\u{1F44D}');
  });

  it('preserves unknown shortcodes', () => {
    const { processed } = preprocess(':nonexistent_emoji:');
    expect(processed).toBe(':nonexistent_emoji:');
  });

  it('converts multiple emoji', () => {
    const { processed } = preprocess(':fire: :star:');
    expect(processed).toContain('\u{1F525}');
    expect(processed).toContain('\u2B50');
  });
});

// ── HTML entities ───────────────────────────────────────────────────────────

describe('preprocessMarkdown: HTML entities', () => {
  it('converts named entities', () => {
    const { processed } = preprocess('&copy; &reg; &trade;');
    expect(processed).toContain('\u00A9');
    expect(processed).toContain('\u00AE');
    expect(processed).toContain('\u2122');
  });

  it('converts decimal numeric entities', () => {
    const { processed } = preprocess('&#169;');
    expect(processed).toBe('\u00A9');
  });

  it('converts hex numeric entities', () => {
    const { processed } = preprocess('&#x2764;');
    expect(processed).toBe('\u2764');
  });

  it('converts arrow entities', () => {
    const { processed } = preprocess('&rarr; &larr;');
    expect(processed).toContain('\u2192');
    expect(processed).toContain('\u2190');
  });

  it('converts Greek letters', () => {
    const { processed } = preprocess('&alpha; &beta; &pi;');
    expect(processed).toContain('\u03B1');
    expect(processed).toContain('\u03B2');
    expect(processed).toContain('\u03C0');
  });
});

// ── Inline text color ───────────────────────────────────────────────────────

describe('preprocessMarkdown: inline text color', () => {
  it('converts <!--tc:red-->text<!--/tc--> to marker tokens', () => {
    const { processed } = preprocess('Hello <!--tc:red-->red text<!--/tc--> world');
    expect(processed).toContain(makeColorOpen('red') + 'red text' + COLOR_CLOSE);
    expect(processed).not.toContain('<!--tc:');
  });

  it('handles multiple colors', () => {
    const { processed } = preprocess('<!--tc:red-->R<!--/tc--> <!--tc:blue-->B<!--/tc-->');
    expect(processed).toContain(makeColorOpen('red') + 'R' + COLOR_CLOSE);
    expect(processed).toContain(makeColorOpen('blue') + 'B' + COLOR_CLOSE);
  });
});

// ── Block props metadata ────────────────────────────────────────────────────

describe('preprocessMarkdown: block props', () => {
  it('extracts blockProps and creates marker + map entry', () => {
    const input = '<!--blockProps:{"textColor":"red"}-->\nRed paragraph';
    const { processed, blockPropsMap } = preprocess(input);
    expect(blockPropsMap).toHaveLength(1);
    expect(blockPropsMap[0]).toEqual({ textColor: 'red' });
    expect(processed).toContain(BLOCK_META_MARKER + '0');
    expect(processed).not.toContain('<!--blockProps:');
  });

  it('extracts multiple blockProps in order', () => {
    const input = '<!--blockProps:{"textColor":"red"}-->\nFirst\n\n<!--blockProps:{"textAlignment":"center"}-->\nSecond';
    const { blockPropsMap } = preprocess(input);
    expect(blockPropsMap).toHaveLength(2);
    expect(blockPropsMap[0]).toEqual({ textColor: 'red' });
    expect(blockPropsMap[1]).toEqual({ textAlignment: 'center' });
  });

  it('handles combined props', () => {
    const input = '<!--blockProps:{"textColor":"red","backgroundColor":"blue","textAlignment":"center"}-->\nStyled';
    const { blockPropsMap } = preprocess(input);
    expect(blockPropsMap[0]).toEqual({
      textColor: 'red',
      backgroundColor: 'blue',
      textAlignment: 'center',
    });
  });
});

// ── Markdown comments ───────────────────────────────────────────────────────

describe('preprocessMarkdown: comments', () => {
  it('strips [comment]: # lines', () => {
    const { processed, comments } = preprocess('Visible\n\n[hidden comment]: #\n\nAlso visible');
    expect(processed).not.toContain('[hidden comment]: #');
    expect(processed).toContain('Visible');
    expect(processed).toContain('Also visible');
    expect(comments).toHaveLength(1);
    expect(comments[0].trim()).toBe('[hidden comment]: #');
  });

  it('strips multiple comments', () => {
    const { comments } = preprocess('[a]: #\n[b]: #');
    expect(comments).toHaveLength(2);
  });

  it('preserves comments for restoration', () => {
    const { comments } = preprocess('[TODO: fix this]: #');
    expect(comments[0].trim()).toBe('[TODO: fix this]: #');
  });
});

// ── Image properties ────────────────────────────────────────────────────────

describe('preprocessMarkdown: image properties', () => {
  it('extracts width from <img> tags', () => {
    const { processed, imageProps } = preprocess('<img src="/api/assets/test.png" alt="test" width="300" />');
    expect(processed).toContain('![test](/api/assets/test.png)');
    expect(imageProps['/api/assets/test.png'].previewWidth).toBe(300);
  });

  it('extracts alignment from <div align="center"><img/></div>', () => {
    const { processed, imageProps } = preprocess('<div align="center"><img src="img.png" alt="centered" /></div>');
    expect(processed).toContain('![centered](img.png)');
    expect(imageProps['img.png'].textAlignment).toBe('center');
  });

  it('extracts both width and alignment', () => {
    const { imageProps } = preprocess('<div align="right"><img src="x.png" alt="" width="500" /></div>');
    expect(imageProps['x.png'].previewWidth).toBe(500);
    expect(imageProps['x.png'].textAlignment).toBe('right');
  });
});

// ── Code block protection ───────────────────────────────────────────────────

describe('preprocessMarkdown: code block protection', () => {
  it('does not transform <ins> inside code blocks', () => {
    const input = '```text\nThis is <ins>underlined</ins>.\n```';
    const { processed } = preprocess(input);
    expect(processed).toContain('<ins>underlined</ins>');
    expect(processed).not.toContain(UNDERLINE_OPEN);
  });

  it('does not transform ==highlight== inside code blocks', () => {
    const input = '```text\nThis is ==highlighted==.\n```';
    const { processed } = preprocess(input);
    expect(processed).toContain('==highlighted==');
    expect(processed).not.toContain(HIGHLIGHT_OPEN);
  });

  it('does not transform :emoji: inside code blocks', () => {
    const input = '```text\n:rocket: :fire:\n```';
    const { processed } = preprocess(input);
    expect(processed).toContain(':rocket:');
    expect(processed).not.toContain('\u{1F680}');
  });

  it('does not transform &entities; inside code blocks', () => {
    const input = '```text\n&copy; &reg;\n```';
    const { processed } = preprocess(input);
    expect(processed).toContain('&copy;');
    expect(processed).not.toContain('\u00A9');
  });

  it('does not transform <!--blockProps:--> inside code blocks', () => {
    const input = '```text\n<!--blockProps:{"textColor":"red"}-->\n```';
    const { processed, blockPropsMap } = preprocess(input);
    expect(processed).toContain('<!--blockProps:');
    expect(blockPropsMap).toHaveLength(0);
  });

  it('does not strip [comment]: # inside code blocks', () => {
    const input = '```text\n[This comment is hidden]: #\n```';
    const { processed, comments } = preprocess(input);
    expect(processed).toContain('[This comment is hidden]: #');
    expect(comments).toHaveLength(0);
  });

  it('does not transform --- into HR inside code blocks', () => {
    const input = '```text\n---\n```';
    const { processed } = preprocess(input);
    expect(processed).toContain('---');
    expect(processed).not.toContain(HR_PLACEHOLDER);
  });

  it('does not transform <!--tc:color--> inside code blocks', () => {
    const input = '```text\n<!--tc:red-->text<!--/tc-->\n```';
    const { processed } = preprocess(input);
    expect(processed).toContain('<!--tc:red-->');
  });

  it('transforms content outside code blocks while preserving inside', () => {
    const input = '==highlight outside==\n\n```text\n==highlight inside==\n```\n\n==highlight after==';
    const { processed } = preprocess(input);
    // Outside code block: converted
    expect(processed).toContain(HIGHLIGHT_OPEN + 'highlight outside' + HIGHLIGHT_CLOSE);
    expect(processed).toContain(HIGHLIGHT_OPEN + 'highlight after' + HIGHLIGHT_CLOSE);
    // Inside code block: preserved
    expect(processed).toContain('==highlight inside==');
  });
});

// ── restoreBlockProps ───────────────────────────────────────────────────────

describe('restoreBlockProps', () => {
  it('applies blockPropsMap to blocks following markers', () => {
    const blocks = [
      { id: '1', type: 'paragraph', props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' }, content: [{ type: 'text', text: BLOCK_META_MARKER + '0' }] },
      { id: '2', type: 'paragraph', props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' }, content: [{ type: 'text', text: 'Red text' }] },
    ];
    const blockPropsMap = [{ textColor: 'red' }];
    const result = restoreBlockProps(blocks, {}, blockPropsMap);
    // Marker paragraph removed
    expect(result).toHaveLength(1);
    expect(result[0].props.textColor).toBe('red');
  });

  it('applies multiple blockProps in order', () => {
    const blocks = [
      { id: '1', type: 'paragraph', props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' }, content: [{ type: 'text', text: BLOCK_META_MARKER + '0' }] },
      { id: '2', type: 'paragraph', props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' }, content: [{ type: 'text', text: 'Red' }] },
      { id: '3', type: 'paragraph', props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' }, content: [{ type: 'text', text: BLOCK_META_MARKER + '1' }] },
      { id: '4', type: 'paragraph', props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' }, content: [{ type: 'text', text: 'Centered' }] },
    ];
    const blockPropsMap = [{ textColor: 'red' }, { textAlignment: 'center' }];
    const result = restoreBlockProps(blocks, {}, blockPropsMap);
    expect(result).toHaveLength(2);
    expect(result[0].props.textColor).toBe('red');
    expect(result[1].props.textAlignment).toBe('center');
  });

  it('restores highlight markers in inline content', () => {
    const blocks = [
      { id: '1', type: 'paragraph', props: {}, content: [
        { type: 'text', text: 'before ' + HIGHLIGHT_OPEN + 'yellow' + HIGHLIGHT_CLOSE + ' after', styles: {} }
      ] },
    ];
    const result = restoreBlockProps(blocks, {}, []);
    const content = result[0].content;
    expect(content).toHaveLength(3);
    expect(content[0].text).toBe('before ');
    expect(content[1].text).toBe('yellow');
    expect(content[1].styles.backgroundColor).toBe('yellow');
    expect(content[2].text).toBe(' after');
  });

  it('restores underline markers in inline content', () => {
    const blocks = [
      { id: '1', type: 'paragraph', props: {}, content: [
        { type: 'text', text: UNDERLINE_OPEN + 'underlined' + UNDERLINE_CLOSE, styles: {} }
      ] },
    ];
    const result = restoreBlockProps(blocks, {}, []);
    expect(result[0].content[0].text).toBe('underlined');
    expect(result[0].content[0].styles.underline).toBe(true);
  });

  it('restores inline textColor markers', () => {
    const blocks = [
      { id: '1', type: 'paragraph', props: {}, content: [
        { type: 'text', text: makeColorOpen('green') + 'green text' + COLOR_CLOSE, styles: {} }
      ] },
    ];
    const result = restoreBlockProps(blocks, {}, []);
    expect(result[0].content[0].text).toBe('green text');
    expect(result[0].content[0].styles.textColor).toBe('green');
  });

  it('restores image previewWidth', () => {
    const blocks = [
      { id: '1', type: 'image', props: { url: 'test.png', previewWidth: undefined, textAlignment: 'left' }, content: [] },
    ];
    const imageProps = { 'test.png': { previewWidth: 400 } };
    const result = restoreBlockProps(blocks, imageProps, []);
    expect(result[0].props.previewWidth).toBe(400);
  });

  it('restores image textAlignment', () => {
    const blocks = [
      { id: '1', type: 'image', props: { url: 'test.png', textAlignment: 'left' }, content: [] },
    ];
    const imageProps = { 'test.png': { textAlignment: 'center' } };
    const result = restoreBlockProps(blocks, imageProps, []);
    expect(result[0].props.textAlignment).toBe('center');
  });
});

// ── Comprehensive document ──────────────────────────────────────────────────

describe('preprocessMarkdown: comprehensive document', () => {
  it('handles all features in one document', () => {
    const input = [
      '# Title',
      '',
      'Normal **bold** *italic* ~~strike~~ `code` paragraph.',
      '',
      '==highlighted text==',
      '',
      '<ins>underlined</ins>',
      '',
      '---',
      '',
      ':rocket: :fire:',
      '',
      '&copy; &rarr;',
      '',
      '<!--tc:red-->colored<!--/tc-->',
      '',
      '<!--blockProps:{"textColor":"blue"}-->',
      'Blue paragraph',
      '',
      '[hidden]: #',
      '',
      '```text',
      '==not highlighted==',
      ':not_emoji:',
      '&not_entity;',
      '<ins>not underlined</ins>',
      '---',
      '<!--blockProps:{"nope":"nope"}-->',
      '[not hidden]: #',
      '```',
    ].join('\n');

    const { processed, blockPropsMap, comments, imageProps } = preprocess(input);

    // Standard markdown preserved
    expect(processed).toContain('**bold**');
    expect(processed).toContain('*italic*');
    expect(processed).toContain('~~strike~~');
    expect(processed).toContain('`code`');

    // Extensions processed
    expect(processed).toContain(HIGHLIGHT_OPEN);
    expect(processed).toContain(UNDERLINE_OPEN);
    expect(processed).toContain(HR_PLACEHOLDER);
    expect(processed).toContain('\u{1F680}'); // rocket
    expect(processed).toContain('\u00A9');    // copyright
    expect(processed).toContain(makeColorOpen('red'));

    // Block props extracted
    expect(blockPropsMap).toHaveLength(1);
    expect(blockPropsMap[0].textColor).toBe('blue');

    // Comments stripped
    expect(comments).toHaveLength(1);
    expect(comments[0].trim()).toBe('[hidden]: #');

    // Code block content preserved
    expect(processed).toContain('==not highlighted==');
    expect(processed).toContain(':not_emoji:');
    expect(processed).toContain('&not_entity;');
    expect(processed).toContain('<ins>not underlined</ins>');
    expect(processed).toContain('[not hidden]: #');
  });
});
