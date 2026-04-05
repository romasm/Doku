import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import FolderView from './components/FolderView';
import { fetchConfig, fetchTree, fetchDoc, saveDoc, deleteDoc, createFolder } from './api';
import './App.css';

function DocPage({ onTreeChange }) {
  const params = useParams();
  const navigate = useNavigate();
  const docPath = params['*'] || '';
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!docPath) {
      setDoc(null);
      return;
    }
    setLoading(true);
    fetchDoc(docPath)
      .then((d) => setDoc(d))
      .catch(() => setDoc(null))
      .finally(() => setLoading(false));
  }, [docPath]);

  const handleSave = useCallback(
    async (content) => {
      await saveDoc(docPath, content);
      onTreeChange();
    },
    [docPath, onTreeChange]
  );

  const handleDelete = useCallback(async () => {
    if (!confirm('Delete this document?')) return;
    await deleteDoc(docPath);
    onTreeChange();
    navigate('/');
  }, [docPath, navigate, onTreeChange]);

  const handleAddChild = useCallback(async () => {
    const name = prompt('Document name:');
    if (!name) return;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    await createFolder(docPath);
    const childPath = `${docPath}/${slug}`;
    await saveDoc(childPath, `# ${name}\n\n`);
    onTreeChange();
    navigate(`/doc/${childPath}`);
  }, [docPath, onTreeChange, navigate]);

  if (!docPath) {
    return (
      <div className="welcome">
        <h1>Doku</h1>
        <p>Select a document from the sidebar or create a new one.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!doc) {
    return <div className="not-found">Document not found.</div>;
  }

  if (doc.isFolder) {
    return (
      <FolderView
        key={docPath}
        folderPath={docPath}
        onTreeChange={onTreeChange}
      />
    );
  }

  return (
    <Editor
      key={docPath}
      content={doc.content}
      docPath={docPath}
      onSave={handleSave}
      onDelete={handleDelete}
      onAddChild={handleAddChild}
      isFolder={false}
    />
  );
}

export default function App() {
  const [tree, setTree] = useState([]);
  const [projectName, setProjectName] = useState('Doku');
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const navigate = useNavigate();

  const loadTree = useCallback(() => {
    fetchTree().then(setTree).catch(console.error);
  }, []);

  useEffect(() => {
    loadTree();
    fetchConfig().then((c) => setProjectName(c.projectName)).catch(() => {});
  }, [loadTree]);

  // "New Document" handler used by both sidebar entries and root button.
  // parentPath = '' for root, or the path of the item clicked.
  // For files: creates a folder from the file and adds a child doc.
  // For folders: adds a child doc inside the folder.
  // For root: creates a new root-level doc.
  const handleNewDoc = useCallback(
    async (parentPath = '') => {
      const name = prompt('Document name:');
      if (!name) return;
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      if (!parentPath) {
        // Root-level doc
        await saveDoc(slug, `# ${name}\n\n`);
        loadTree();
        navigate(`/doc/${slug}`);
        return;
      }

      // Check if parent is a folder or file by checking if the folder exists
      // Creating the folder is idempotent — if it already exists, no-op
      await createFolder(parentPath);
      const childPath = `${parentPath}/${slug}`;
      await saveDoc(childPath, `# ${name}\n\n`);
      loadTree();
      navigate(`/doc/${childPath}`);
    },
    [loadTree, navigate]
  );

  const handleSearchSelect = useCallback(
    (docPath) => {
      navigate(`/doc/${docPath}`);
    },
    [navigate]
  );

  return (
    <>
      <Sidebar
        tree={tree}
        projectName={projectName}
        onNewDoc={handleNewDoc}
        onSearchSelect={handleSearchSelect}
        sidebarWidth={sidebarWidth}
        onResize={setSidebarWidth}
      />
      <main className="main-content">
        <div className="editor-area">
          <Routes>
            <Route
              path="/"
              element={<DocPage onTreeChange={loadTree} />}
            />
            <Route
              path="/doc/*"
              element={<DocPage onTreeChange={loadTree} />}
            />
          </Routes>
        </div>
      </main>
    </>
  );
}
