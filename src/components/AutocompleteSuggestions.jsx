import React, { forwardRef } from 'react';
import './AutocompleteSuggestions.css';
import { useSuggestions } from '../services/api';

const AutocompleteSuggestions = forwardRef(({ 
  query, 
  onSelect, 
  visible, 
  focusedIndex = -1,
  lastOperator = null 
}, ref) => {
  const { data: suggestions, isLoading, isError } = useSuggestions(query);

  if (!visible) return null;
  
  const renderEmptyState = () => {
    if (isLoading) return <div className="suggestions loading">Loading suggestions...</div>;
    if (isError) return <div className="suggestions error">Error loading suggestions</div>;
    
    if (!query && lastOperator) {
      return <div className="suggestions hint">Type to see suggestions after {lastOperator}</div>;
    }
    
    if (!query) {
      return <div className="suggestions hint">Type to see variable suggestions</div>;
    }
    
    if (!suggestions || suggestions.length === 0) {
      return <div className="suggestions empty">No matching suggestions found</div>;
    }
    
    return null;
  };

  const emptyState = renderEmptyState();
  if (emptyState) return emptyState;

  return (
    <div className="suggestions-container" ref={ref}>
      <div className="suggestions-header">
        <span className="suggestions-title">Suggestions</span>
        {query && <span className="search-query">for "{query}"</span>}
      </div>
      <ul className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <li 
            key={suggestion.id || index} 
            className={`suggestion-item ${focusedIndex === index ? 'suggestion-focused' : ''}`}
            onClick={() => onSelect(suggestion)}
          >
            <div className="suggestion-content">
              <span className="suggestion-name">{suggestion.name}</span>
              {suggestion.description && (
                <span className="suggestion-description">{suggestion.description}</span>
              )}
            </div>
            {suggestion.type && (
              <span className="suggestion-type">{suggestion.type}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
});

export default AutocompleteSuggestions;