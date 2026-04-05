import React, { useState, useRef, useEffect } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useTheme } from '../useTheme';
import { SmilePlusIcon } from './icons';
import './EmojiPicker.css';

export default function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(emoji) {
    onChange(emoji.native);
    setOpen(false);
  }

  function handleRemove(e) {
    e.stopPropagation();
    onChange(undefined);
    setOpen(false);
  }

  return (
    <div className="emoji-picker-wrapper" ref={ref}>
      <button
        className={`emoji-picker-trigger ${value ? 'has-emoji' : ''}`}
        onClick={() => setOpen(!open)}
        title={value ? 'Change page icon' : 'Add page icon'}
      >
        {value || <SmilePlusIcon size={16} />}
      </button>
      {open && (
        <div className="emoji-picker-dropdown">
          {value && (
            <button className="emoji-picker-remove" onClick={handleRemove}>
              Remove icon
            </button>
          )}
          <Picker
            data={data}
            onEmojiSelect={handleSelect}
            theme={theme}
            previewPosition="none"
            skinTonePosition="search"
            set="native"
            perLine={8}
            maxFrequentRows={2}
          />
        </div>
      )}
    </div>
  );
}
