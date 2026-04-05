import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useDocEditor } from '../useDocEditor';
import { useTheme } from '../useTheme';
import { DeleteIcon, MaximizeIcon, MinimizeIcon, FolderOpenIcon } from './icons';
import { openFolder } from '../api';
import Breadcrumb from './Breadcrumb';
import TableOfContents from './TableOfContents';
import EmojiPicker from './EmojiPicker';
import './Editor.css';

export default function Editor({ content, docPath, onSave, onDelete, isFolder, fullWidth, onToggleWidth, onTreeChange }) {
  const editorContainerRef = useRef(null);
  const theme = useTheme();
  const { editor, handleChange, frontmatterRef } = useDocEditor(content, onSave);
  const [icon, setIcon] = useState(undefined);

  // Sync icon from frontmatter after content loads
  useEffect(() => {
    if (content) {
      // Small delay to let useDocEditor parse frontmatter first
      const timer = setTimeout(() => setIcon(frontmatterRef.current?.icon), 100);
      return () => clearTimeout(timer);
    }
  }, [content, frontmatterRef]);

  const handleEmojiChange = useCallback((emoji) => {
    setIcon(emoji);
    if (emoji) {
      frontmatterRef.current.icon = emoji;
    } else {
      delete frontmatterRef.current.icon;
    }
    // Trigger save
    handleChange();
    // Refresh sidebar after a short delay for save to complete
    if (onTreeChange) setTimeout(onTreeChange, 1500);
  }, [frontmatterRef, handleChange, onTreeChange]);

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <div className="editor-toolbar-left">
          <Breadcrumb docPath={docPath} />
          <EmojiPicker value={icon} onChange={handleEmojiChange} />
        </div>
        <div className="editor-toolbar-actions">
          <button className="editor-width-btn" onClick={onToggleWidth} title={fullWidth ? 'Narrow view' : 'Full width'}>
            {fullWidth ? <MinimizeIcon size={16} /> : <MaximizeIcon size={16} />}
          </button>
          <button className="editor-action-btn" onClick={() => openFolder(docPath)} title="Open folder">
            <FolderOpenIcon size={16} />
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
      <TableOfContents editor={editor} />
    </div>
  );
}
