import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumb.css';

export default function Breadcrumb({ docPath }) {
  const parts = docPath.split('/');

  return (
    <span className="breadcrumb">
      {parts.map((part, i) => {
        const path = parts.slice(0, i + 1).join('/');
        const isLast = i === parts.length - 1;
        return (
          <span key={path} className="breadcrumb-segment">
            {i > 0 && <span className="breadcrumb-sep">/</span>}
            {isLast ? (
              <span className="breadcrumb-current">{part}</span>
            ) : (
              <Link to={`/doc/${path}`} className="breadcrumb-link">{part}</Link>
            )}
          </span>
        );
      })}
    </span>
  );
}
