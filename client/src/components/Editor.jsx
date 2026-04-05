import React, { useMemo, useCallback, useRef } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { parseFrontmatter, serializeFrontmatter } from '../frontmatter';
import './Editor.css';

export default function Editor({ content, docPath, onSave, onDelete, isFolder }) {
  const saveTimerRef = useRef(null);
  const frontmatterRef = useRef({});

  const editor = useCreateBlockNote({
    initialContent: undefined,
  });

  useMemo(() => {
    if (editor && content !== undefined) {
      const { frontmatter, body } = parseFrontmatter(content);
      frontmatterRef.current = frontmatter;
      (async () => {
        try {
          const blocks = await editor.tryParseMarkdownToBlocks(body);
          editor.replaceBlocks(editor.document, blocks);
        } catch {
          editor.replaceBlocks(editor.document, [
            { type: 'paragraph', content: [{ type: 'text', text: body }] },
          ]);
        }
      })();
    }
  }, [editor, content]);

  const handleChange = useCallback(async () => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const md = await editor.blocksToMarkdownLossy(editor.document);
      const full = serializeFrontmatter(frontmatterRef.current, md);
      onSave(full);
    }, 1000);
  }, [editor, onSave]);

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <span className="editor-path">{docPath}</span>
        <div className="editor-toolbar-actions">
          {!isFolder && (
            <button className="editor-delete-btn" onClick={onDelete}>
              Delete
            </button>
          )}
        </div>
      </div>
      <div className="editor-blocknote">
        <BlockNoteView editor={editor} onChange={handleChange} theme="light" />
      </div>
    </div>
  );
}
