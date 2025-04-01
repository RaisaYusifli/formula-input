import React, { useState, useRef, useEffect } from 'react';
import { useFormulaStore } from '../store/formulaStore';
import './TokenTag.css';

const TokenTag = ({ token, index, isActive, onSelect }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const tokenRef = useRef(null);

  const { removeTokenAtIndex, updateToken } = useFormulaStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          tokenRef.current && !tokenRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTagClick = () => {
    onSelect(index);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handleDropdownOptionClick = (option, e) => {
    e.stopPropagation(); 
    switch (option.id) {
      case 'edit':
        const newValue = prompt('Edit value:', token.value);
        if (newValue !== null && newValue.trim() !== '') {
          updateToken(index, { ...token, value: token.type === 'number' ? parseFloat(newValue) : newValue });
        }
        break;
      case 'replace':
        const replacement = prompt('Replace with (variable or number):', '');
        if (replacement !== null && replacement.trim() !== '') {
          const isNumber = !isNaN(parseFloat(replacement)) && parseFloat(replacement).toString() === replacement.trim();
          updateToken(index, { 
            type: isNumber ? 'number' : 'variable', 
            value: isNumber ? parseFloat(replacement) : replacement 
          });
        }
        break;
      case 'format':
        alert(`Formatting options for ${token.value} would appear here`);
        break;
      case 'delete':
        removeTokenAtIndex(index);
        break;
      case 'change':
        const operators = ['+', '-', '*', '/', '^', '(', ')'];
        const operatorIndex = operators.indexOf(token.value);
        const nextOperator = operators[(operatorIndex + 1) % operators.length];
        updateToken(index, { ...token, value: nextOperator });
        break;
      default:
        break;
    }
    
    setDropdownOpen(false);
  };

  const getDropdownOptions = () => {
    switch (token.type) {
      case 'variable':
        return [
          { id: 'edit', label: 'Edit', icon: '✏️' },
          { id: 'replace', label: 'Replace', icon: '🔄' },
          { id: 'format', label: 'Format', icon: '🎨' },
          { id: 'delete', label: 'Delete', icon: '🗑️' }
        ];
      case 'number':
        return [
          { id: 'edit', label: 'Edit', icon: '✏️' },
          { id: 'format', label: 'Format', icon: '🎨' },
          { id: 'delete', label: 'Delete', icon: '🗑️' }
        ];
      case 'operator':
        return [
          { id: 'change', label: 'Change Operator', icon: '🔄' },
          { id: 'delete', label: 'Delete', icon: '🗑️' }
        ];
      default:
        return [];
    }
  };

  const getTokenColor = () => {
    switch (token.type) {
      case 'variable':
        return { background: '#e3f2fd', border: '#90caf9', text: '#1976d2' };
      case 'number':
        return { background: '#e8f5e9', border: '#a5d6a7', text: '#388e3c' };
      case 'operator':
        return { background: 'transparent', border: 'transparent', text: '#333' };
      default:
        return { background: '#f5f5f5', border: '#e0e0e0', text: '#333' };
    }
  };

  const renderTag = () => {
    const colors = getTokenColor();
    
    if (token.type === 'operator') {
      return (
        <div className="operator-container">
          <span 
            className={`operator ${isActive ? 'active-operator' : ''}`} 
            onClick={handleTagClick}
            style={{ color: colors.text }}
          >
            {token.value}
          </span>
          <button 
            className="operator-dropdown-toggle" 
            onClick={toggleDropdown}
            aria-label="Operator options"
          >
            <span className="dropdown-arrow">▼</span>
          </button>
        </div>
      );
    }
    
    return (
      <div 
        ref={tokenRef}
        className={`tag ${token.type}-tag ${isActive ? 'active' : ''}`} 
        onClick={handleTagClick}
        style={{ 
          backgroundColor: colors.background,
          borderColor: colors.border,
          color: colors.text
        }}
      >
        <span className="tag-value">{token.value}</span>
        <button 
          className="dropdown-toggle" 
          onClick={toggleDropdown}
          aria-label="Toggle options"
        >
          <span className="dropdown-arrow">▼</span>
        </button>
      </div>
    );
  };

  return (
    <div className="token-container">
      {renderTag()}
      {dropdownOpen && (
        <div className="tag-dropdown" ref={dropdownRef}>
          <div className="dropdown-header">
            <span className="dropdown-title">{token.type === 'variable' ? 'Variable Options' : token.type === 'number' ? 'Number Options' : 'Operator Options'}</span>
          </div>
          <div className="dropdown-content">
            {getDropdownOptions().map((option) => (
              <div 
                key={option.id} 
                className="dropdown-option"
                onClick={(e) => handleDropdownOptionClick(option, e)}
              >
                <span className="option-icon">{option.icon}</span>
                <span className="option-label">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenTag;