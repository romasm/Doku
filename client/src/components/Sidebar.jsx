import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import './Sidebar.css';

function TreeItem({ item, onNewDoc }) {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  if (item.type === 'file') {
    const isActive = location.pathname === `/doc/${item.path}`;
    return (
      <NavLink
        to={`/doc/${item.path}`}
        className={`tree-file ${isActive ? 'active' : ''}`}
        title={item.title || item.name}
      >
        <span className="tree-icon">&#128196;</span>
        <span className="tree-label">{item.title || item.name}</span>
        <button
          className="tree-new-doc-btn"
          title="New child document"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onNewDoc(item.path); }}
        >+</button>
      </NavLink>
    );
  }

  const isFolderActive = location.pathname === `/doc/${item.path}`;

  return (
    <div className="tree-folder">
      <div className={`tree-folder-header ${isFolderActive ? 'active' : ''}`}>
        <span
          className={`tree-arrow ${expanded ? 'expanded' : ''}`}
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >&#9654;</span>
        <span
          className="tree-folder-link"
          onClick={() => { navigate(`/doc/${item.path}`); if (!expanded) setExpanded(true); }}
        >
          <span className="tree-icon">&#128193;</span>
          <span className="tree-label">{item.title || item.name}</span>
        </span>
        <button
          className="tree-new-doc-btn"
          title="New child document"
          onClick={(e) => { e.stopPropagation(); onNewDoc(item.path); }}
        >+</button>
      </div>
      {expanded && item.children && (
        <div className="tree-children">
          {item.children.map((child) => (
            <TreeItem
              key={child.path}
              item={child}
              onNewDoc={onNewDoc}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ tree, onNewDoc, onSearchSelect, sidebarWidth, onResize }) {
  const resizing = useRef(false);

  useEffect(() => {
    function onMouseMove(e) {
      if (!resizing.current) return;
      const newWidth = Math.max(200, e.clientX);
      onResize(newWidth);
    }
    function onMouseUp() {
      resizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [onResize]);

  function startResize(e) {
    e.preventDefault();
    resizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  return (
    <aside className="sidebar" style={{ width: sidebarWidth, minWidth: 200 }}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Doku</h2>
      </div>
      <div className="sidebar-search">
        <SearchBar onSelect={onSearchSelect} />
      </div>
      <nav className="sidebar-tree">
        {tree.length === 0 ? (
          <div className="sidebar-empty">No documents yet.</div>
        ) : (
          tree.map((item) => (
            <TreeItem
              key={item.path}
              item={item}
              onNewDoc={onNewDoc}
            />
          ))
        )}
      </nav>
      <div className="sidebar-new-root">
        <button className="sidebar-new-root-btn" onClick={() => onNewDoc('')}>
          + New Document
        </button>
      </div>
      <div className="sidebar-resize-handle" onMouseDown={startResize} />
    </aside>
  );
}
