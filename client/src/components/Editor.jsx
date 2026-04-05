import React, { useMemo, useCallback, useRef } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { parseFrontmatter, serializeFrontmatter } from '../frontmatter';
import { blocksToMarkdown, preprocessMarkdown, restoreImageWidths } from '../imageMarkdown';
import { useTheme } from '../useTheme';
import { uploadImage } from '../api';
import { DeleteIcon, MaximizeIcon, MinimizeIcon } from './icons';
import Breadcrumb from './Breadcrumb';
import './Editor.css';

export default function Editor({ content, docPath, onSave, onDelete, isFolder, fullWidth, onToggleWidth }) {
  const saveTimerRef = useRef(null);
  const frontmatterRef = useRef({});
  const editorContainerRef = useRef(null);
  const theme = useTheme();

  const editor = useCreateBlockNote({
    initialContent: undefined,
    uploadFile: async (file) => {
      const result = await uploadImage(file);
      return result.url;
    },
  });

  useMemo(() => {
    if (editor && content !== undefined) {
      const { frontmatter, body } = parseFrontmatter(content);
      frontmatterRef.current = frontmatter;
      (async () => {
        try {
          const { processed, imageProps } = preprocessMarkdown(body);
          const blocks = await editor.tryParseMarkdownToBlocks(processed);
          restoreImageWidths(blocks, imageProps);
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
      try {
        const md = await blocksToMarkdown(editor);
        const full = serializeFrontmatter(frontmatterRef.current, md);
        await onSave(full);
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 1000);
  }, [editor, onSave]);

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <Breadcrumb docPath={docPath} />
        <div className="editor-toolbar-actions">
          <button className="editor-width-btn" onClick={onToggleWidth} title={fullWidth ? 'Narrow view' : 'Full width'}>
            {fullWidth ? <MinimizeIcon size={16} /> : <MaximizeIcon size={16} />}
          </button>
          {!isFolder && (
            <button className="editor-delete-btn" onClick={onDelete} title="Delete document">
              <DeleteIcon size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="editor-blocknote" ref={editorContainerRef}>
        <BlockNoteView editor={editor} onChange={handleChange} theme={theme} />
      </div>
    </div>
  );
}
