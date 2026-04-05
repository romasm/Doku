import React, { useCallback, useRef } from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useDocEditor } from '../useDocEditor';
import { useTheme } from '../useTheme';
import { DeleteIcon, MaximizeIcon, MinimizeIcon } from './icons';
import Breadcrumb from './Breadcrumb';
import './Editor.css';

export default function Editor({ content, docPath, onSave, onDelete, isFolder, fullWidth, onToggleWidth }) {
  const editorContainerRef = useRef(null);
  const theme = useTheme();
  const { editor, handleChange } = useDocEditor(content, onSave);

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
