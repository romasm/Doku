import React, { useState, useRef, useEffect } from 'react';
import { searchDocs } from '../api';
import { SearchIcon } from './icons';
import './SearchBar.css';

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const timerRef = useRef(null);
  const wrapperRef = useRef(null);

  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleGlobalKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    setSelectedIdx(0);

    clearTimeout(timerRef.current);
    if (val.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      const res = await searchDocs(val.trim());
      setResults(res);
      setOpen(res.length > 0);
    }, 200);
  }

  function handleKeyDown(e) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      e.preventDefault();
      handleSelect(results[selectedIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function handleSelect(result) {
    setOpen(false);
    setQuery('');
    setResults([]);
    onSelect(result.path);
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function highlightSnippet(snippet) {
    if (!snippet || !query.trim()) return escapeHtml(snippet);
    const escaped = escapeHtml(snippet);
    const escapedQuery = escapeHtml(query);
    const regex = new RegExp(`(${escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
  }

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <span className="search-icon"><SearchIcon size={14} /></span>
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder="Search... (Ctrl+K)"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && (
        <div className="search-results">
          {results.map((r, i) => (
            <div
              key={r.path}
              className={`search-result ${i === selectedIdx ? 'selected' : ''}`}
              onClick={() => handleSelect(r)}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              <div className="search-result-title">{r.title}</div>
              <div className="search-result-path">{r.path}</div>
              {r.snippet && (
                <div
                  className="search-result-snippet"
                  dangerouslySetInnerHTML={{ __html: highlightSnippet(r.snippet) }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
