import { useEffect, useCallback, useRef } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import { createCodeBlockSpec } from '@blocknote/core';
import { createHighlighter } from 'shiki';
import { parseFrontmatter, serializeFrontmatter } from './frontmatter';
import { blocksToMarkdown, preprocessMarkdown, restoreBlockProps } from './imageMarkdown';
import { uploadImage } from './api';
import { markUserEdit } from './App';

// Create schema with Shiki syntax highlighting.
// createHighlighter returns a promise — BlockNote's prosemirror-highlight plugin
// handles this asynchronously and re-renders decorations when it resolves.
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    codeBlock: createCodeBlockSpec({
      defaultLanguage: 'text',
      supportedLanguages: {
        text: { name: 'Plain Text', aliases: ['txt', 'plaintext'] },
        javascript: { name: 'JavaScript', aliases: ['js'] },
        typescript: { name: 'TypeScript', aliases: ['ts'] },
        python: { name: 'Python', aliases: ['py'] },
        html: { name: 'HTML' },
        css: { name: 'CSS' },
        json: { name: 'JSON' },
        bash: { name: 'Bash', aliases: ['sh', 'shell'] },
        markdown: { name: 'Markdown', aliases: ['md'] },
        yaml: { name: 'YAML', aliases: ['yml'] },
        sql: { name: 'SQL' },
        java: { name: 'Java' },
        c: { name: 'C' },
        cpp: { name: 'C++' },
        go: { name: 'Go' },
        rust: { name: 'Rust', aliases: ['rs'] },
        ruby: { name: 'Ruby', aliases: ['rb'] },
        php: { name: 'PHP' },
        xml: { name: 'XML' },
        jsx: { name: 'JSX' },
        tsx: { name: 'TSX' },
      },
      createHighlighter: () => createHighlighter({
        themes: ['github-dark', 'github-light'],
        langs: [
          'javascript', 'typescript', 'python', 'html', 'css', 'json',
          'bash', 'markdown', 'yaml', 'sql', 'java', 'c', 'cpp', 'go',
          'rust', 'ruby', 'php', 'shell', 'xml', 'jsx', 'tsx',
        ],
      }),
    }),
  },
});

export function useDocEditor(content, onSave) {
  const saveTimerRef = useRef(null);
  const frontmatterRef = useRef({});
  const commentsRef = useRef([]);
  const loadingRef = useRef(false);

  const editor = useCreateBlockNote({
    schema,
    initialContent: undefined,
    uploadFile: async (file) => {
      const result = await uploadImage(file);
      return result.url;
    },
  });

  // Load content into editor (suppress onChange during load to avoid spurious saves)
  useEffect(() => {
    if (editor && content !== undefined) {
      loadingRef.current = true;
      const { frontmatter, body } = parseFrontmatter(content);
      frontmatterRef.current = frontmatter;
      (async () => {
        try {
          const { processed, imageProps, comments, blockPropsMap } = preprocessMarkdown(body);
          commentsRef.current = comments;
          const blocks = await editor.tryParseMarkdownToBlocks(processed);
          const cleaned = restoreBlockProps(blocks, imageProps, blockPropsMap);
          editor.replaceBlocks(editor.document, cleaned);
        } catch {
          editor.replaceBlocks(editor.document, [
            { type: 'paragraph', content: [{ type: 'text', text: body }] },
          ]);
        }
        // Allow onChange to fire saves after a short delay
        setTimeout(() => { loadingRef.current = false; }, 200);
      })();
    }
  }, [editor, content]);

  // Cleanup save timer on unmount
  useEffect(() => {
    return () => clearTimeout(saveTimerRef.current);
  }, []);

  const handleChange = useCallback(async () => {
    if (loadingRef.current) return;
    markUserEdit();
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        let md = await blocksToMarkdown(editor);
        // Re-append markdown comments at the end
        if (commentsRef.current.length > 0) {
          md = md.trimEnd() + '\n\n' + commentsRef.current.join('\n') + '\n';
        }
        const full = serializeFrontmatter(frontmatterRef.current, md);
        await onSave(full);
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 1000);
  }, [editor, onSave]);

  return { editor, handleChange, frontmatterRef };
}
