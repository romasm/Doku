import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { fetchFolder, saveFolderIndex, openFolder } from '../api';
import { useDocEditor } from '../useDocEditor';
import { useTheme } from '../useTheme';
import { FileTextIcon, FolderOpenIcon, MaximizeIcon, MinimizeIcon } from './icons';
import Breadcrumb from './Breadcrumb';
import TableOfContents from './TableOfContents';
import './FolderView.css';

export default function FolderView({ folderPath, onTreeChange, fullWidth, onToggleWidth }) {
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const editorContainerRef = useRef(null);
  const theme = useTheme();

  const handleSave = useCallback(
    async (content) => {
      await saveFolderIndex(folderPath, content);
      onTreeChange();
    },
    [folderPath, onTreeChange]
  );

  const { editor, handleChange } = useDocEditor(folder?.content, handleSave);

  useEffect(() => {
    if (!folderPath) return;
    setLoading(true);
    fetchFolder(folderPath)
      .then((data) => setFolder(data))
      .catch(() => setFolder(null))
      .finally(() => setLoading(false));
  }, [folderPath]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!folder) return <div className="not-found">Folder not found.</div>;

  return (
    <div className="folder-view">
      <div className="editor-toolbar">
        <Breadcrumb docPath={folderPath} />
        <div className="editor-toolbar-actions">
          <button className="editor-width-btn" onClick={onToggleWidth} title={fullWidth ? 'Narrow view' : 'Full width'}>
            {fullWidth ? <MinimizeIcon size={16} /> : <MaximizeIcon size={16} />}
          </button>
          <button className="editor-action-btn" onClick={() => openFolder(folderPath)} title="Open folder">
            <FolderOpenIcon size={16} />
          </button>
        </div>
      </div>

      <div className="folder-editor" ref={editorContainerRef}>
        <BlockNoteView editor={editor} onChange={handleChange} theme={theme} />
      </div>

      <TableOfContents editor={editor} />

      {folder.children && folder.children.length > 0 && (
        <div className="folder-children">
          <h3 className="folder-children-title">Contents</h3>
          <ul className="folder-children-list">
            {folder.children.map((item) => (
              <li key={item.path} className="folder-child-item">
                <Link
                  to={`/doc/${item.path}`}
                  className="folder-child-link"
                >
                  <span className="folder-child-icon">
                    {item.type === 'folder' ? <FolderOpenIcon size={18} /> : <FileTextIcon size={18} />}
                  </span>
                  <span className="folder-child-name">{item.title || item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
