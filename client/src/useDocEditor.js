import { useEffect, useCallback, useRef } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { parseFrontmatter, serializeFrontmatter } from './frontmatter';
import { blocksToMarkdown, preprocessMarkdown, restoreBlockProps } from './imageMarkdown';
import { uploadImage } from './api';

export function useDocEditor(content, onSave) {
  const saveTimerRef = useRef(null);
  const frontmatterRef = useRef({});
  const commentsRef = useRef([]);

  const editor = useCreateBlockNote({
    initialContent: undefined,
    uploadFile: async (file) => {
      const result = await uploadImage(file);
      return result.url;
    },
  });

  // Load content into editor (useEffect, not useMemo — this is a side effect)
  useEffect(() => {
    if (editor && content !== undefined) {
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
      })();
    }
  }, [editor, content]);

  // Cleanup save timer on unmount
  useEffect(() => {
    return () => clearTimeout(saveTimerRef.current);
  }, []);

  const handleChange = useCallback(async () => {
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

  return { editor, handleChange };
}
