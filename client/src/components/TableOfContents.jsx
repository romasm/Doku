import React, { useState, useEffect, useCallback, useRef } from 'react';
import './TableOfContents.css';

export default function TableOfContents({ editor }) {
  const [headings, setHeadings] = useState([]);
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const extractHeadings = useCallback(() => {
    if (!editor) return;
    const items = [];
    for (const block of editor.document) {
      if (block.type === 'heading' && block.content?.length > 0) {
        const text = block.content.map((c) => c.text || '').join('');
        if (text.trim()) {
          items.push({
            id: block.id,
            text: text.trim(),
            level: block.props?.level || 1,
          });
        }
      }
    }
    setHeadings(items);
  }, [editor]);

  useEffect(() => {
    extractHeadings();
    if (!editor) return;

    const handler = () => extractHeadings();
    editor.onChange(handler);
    return () => editor.onChange(handler);
  }, [editor, extractHeadings]);

  const scrollToHeading = useCallback((id) => {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  }, []);

  // Track which heading is currently in view
  useEffect(() => {
    const editorArea = document.querySelector('.editor-blocknote') || document.querySelector('.editor-area');
    if (!editorArea || headings.length === 0) return;

    const onScroll = () => {
      let current = headings[0]?.id || null;
      for (const h of headings) {
        const el = document.querySelector(`[data-id="${h.id}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) current = h.id;
        }
      }
      setActiveId(current);
    };

    onScroll();
    editorArea.addEventListener('scroll', onScroll, { passive: true });
    return () => editorArea.removeEventListener('scroll', onScroll);
  }, [headings]);


  const overlayRef = useRef(null);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const target = document.querySelector('.editor-blocknote') || document.querySelector('.editor-area');
      if (target) target.scrollTop += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  if (headings.length === 0) return null;

  return (
    <div
      ref={overlayRef}
      className="toc-overlay"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {!visible && (
        <div className="toc-hints">
          {headings.map((h) => (
            <div
              key={h.id}
              className={`toc-hint toc-hint-${h.level} ${activeId === h.id ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
      {visible && (
        <div className="toc-panel">
          <div className="toc-title">On this page</div>
          <nav className="toc-nav">
            {headings.map((h) => (
              <button
                key={h.id}
                className={`toc-item toc-level-${h.level} ${activeId === h.id ? 'active' : ''}`}
                onClick={() => scrollToHeading(h.id)}
              >
                {h.text}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
