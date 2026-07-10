import React, { useMemo } from 'react';
import './Highlight.css';

export default function HighlightText({ text, keywords = [] }) {
  const parsedNodes = useMemo(() => {
    if (!text) return null;
    if (!keywords || keywords.length === 0) return <span>{text}</span>;

    // Filter out empty strings and sort by length descending to match longest phrases first
    const validKeywords = keywords.filter(kw => kw && kw.trim().length > 0);
    if (validKeywords.length === 0) return <span>{text}</span>;

    const sortedKeywords = [...validKeywords].sort((a, b) => b.length - a.length);
    
    // Escape regex special characters
    const escapedKeywords = sortedKeywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    // Create a single capture group with all keywords OR'd together
    const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');

    // Split text using the capture group. 
    // This results in an array where even indices are unmatched text, and odd indices are matched keywords.
    const parts = text.split(regex);

    return parts.map((part, index) => {
      // If it's undefined or empty string, skip to avoid empty span
      if (part === undefined || part === '') return null;

      // Odd indices are the captured matches
      if (index % 2 === 1) {
        return (
          <mark key={`hl-${index}`} className="highlight-word">
            {part}
          </mark>
        );
      }
      return <span key={`text-${index}`}>{part}</span>;
    });
  }, [text, keywords]);

  return <span className="highlight-container">{parsedNodes}</span>;
}
