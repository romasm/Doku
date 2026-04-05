import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { FileTextIcon, FolderOpenIcon, ChevronRightIcon, PlusIcon, SunIcon, MoonIcon } from './icons';
import './Sidebar.css';

const ICON_SIZE = 16;

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
        <span className="tree-icon">{item.icon ? <span className="tree-emoji">{item.icon}</span> : <FileTextIcon size={ICON_SIZE} />}</span>
        <span className="tree-label">{item.title || item.name}</span>
        <span
          className="tree-new-doc-btn"
          title="New child document"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onNewDoc(item.path); }}
        ><PlusIcon size={14} /></span>
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
        ><ChevronRightIcon size={14} /></span>
        <span
          className="tree-folder-link"
          onClick={() => { navigate(`/doc/${item.path}`); if (!expanded) setExpanded(true); }}
        >
          <span className="tree-icon">{item.icon ? <span className="tree-emoji">{item.icon}</span> : <FolderOpenIcon size={ICON_SIZE} />}</span>
          <span className="tree-label">{item.title || item.name}</span>
        </span>
        <span
          className="tree-new-doc-btn"
          title="New child document"
          onClick={(e) => { e.stopPropagation(); onNewDoc(item.path); }}
        ><PlusIcon size={14} /></span>
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

function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('doku-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('doku-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      className="dark-mode-toggle"
      onClick={() => setDark((d) => !d)}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
    </button>
  );
}

export default function Sidebar({ tree, projectName, onNewDoc, onSearchSelect, sidebarWidth, onResize }) {
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
        <h2 className="sidebar-title">{projectName || 'Doku'}</h2>
      </div>
      <div className="sidebar-search">
        <SearchBar onSelect={onSearchSelect} />
      </div>
      <nav className="sidebar-tree">
        {tree.length === 0 && (
          <div className="sidebar-empty">No documents yet.</div>
        )}
        {tree.map((item) => (
          <TreeItem
            key={item.path}
            item={item}
            onNewDoc={onNewDoc}
          />
        ))}
        <button className="sidebar-new-root-btn" onClick={() => onNewDoc('')}>
          <PlusIcon size={14} />
        </button>
      </nav>
      <div className="sidebar-bottom">
        <DarkModeToggle />
      </div>
      <div className="sidebar-resize-handle" onMouseDown={startResize} />
    </aside>
  );
}
