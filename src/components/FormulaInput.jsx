import React, { useState, useRef, useEffect } from 'react';
import { useFormulaStore } from '../store/formulaStore';
import TokenTag from './TokenTag';
import AutocompleteSuggestions from './AutocompleteSuggestions';
import './FormulaInput.css';

const OPERATORS = ['+', '-', '*', '/', '^', '(', ')'];

const FormulaInput = () => {
  const {
    formula,
    cursorPosition,
    inputValue,
    setInputValue,
    setCursorPosition,
    addToken,
    removeToken,
    addOperator,
    processInput,
    calculateResult
  } = useFormulaStore();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const [result, setResult] = useState(null);
  const [lastOperator, setLastOperator] = useState(null);
  const [caretPosition, setCaretPosition] = useState(0);
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      
      const length = inputValue.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [cursorPosition]);

  useEffect(() => {
    if (focusedSuggestionIndex >= 0 && suggestionsRef.current) {
      const element = suggestionsRef.current.querySelector(`.suggestion-item:nth-child(${focusedSuggestionIndex + 1})`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedSuggestionIndex]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(e.target.value.trim().length > 0);
    setFocusedSuggestionIndex(-1);
    setCaretPosition(e.target.selectionStart);
  };

  const handleInputFocus = () => {
    if (inputValue.trim().length > 0) {
      setShowSuggestions(true);
    }
  };

  const processOperatorInput = (operator) => {
    if (inputValue.trim()) {
      processInput();
    }
    addOperator(operator);
    setLastOperator(operator);
    
    setShowSuggestions(true);
  };

  const handleKeyDown = (e) => {
    if (OPERATORS.includes(e.key)) {
      e.preventDefault();
      processOperatorInput(e.key);
      return;
    }

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (focusedSuggestionIndex >= 0 && showSuggestions) {
        } else if (inputValue.trim()) {
          processInput();
          setShowSuggestions(false);
        } else {
          const calculatedResult = calculateResult();
          setResult(calculatedResult);
        }
        break;
        
      case 'Backspace':
        if (inputValue === '') {
          e.preventDefault();
          removeToken();
        }
        break;
        
      case 'Tab':
        e.preventDefault();
        if (showSuggestions) {
          setFocusedSuggestionIndex(prevIndex => 
            prevIndex < 0 ? 0 : prevIndex
          );
        }
        break;
        
      case 'ArrowDown':
        if (showSuggestions) {
          e.preventDefault();
          setFocusedSuggestionIndex(prevIndex => 
            prevIndex < 4 ? prevIndex + 1 : prevIndex
          );
        }
        break;
        
      case 'ArrowUp':
        if (showSuggestions) {
          e.preventDefault();
          setFocusedSuggestionIndex(prevIndex => 
            prevIndex > 0 ? prevIndex - 1 : 0
          );
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setFocusedSuggestionIndex(-1);
        break;
        
      default:
        break;
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    addToken({ type: 'variable', value: suggestion.name });
    setShowSuggestions(false);
    setFocusedSuggestionIndex(-1);
    setInputValue('');
  };

  const handleTokenSelect = (index) => {
    setCursorPosition(index + 1);
    inputRef.current.focus();
  };

  const handleCalculateClick = () => {
    const calculatedResult = calculateResult();
    setResult(calculatedResult);
  };

  const renderFormulaDisplay = () => {
    return (
      <div className="formula-display">
        {formula.map((token, index) => (
          <TokenTag
            key={index}
            token={token}
            index={index}
            isActive={index === cursorPosition - 1}
            onSelect={handleTokenSelect}
          />
        ))}
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            className="formula-text-input"
            placeholder={formula.length === 0 ? "Enter formula" : ""}
            autoFocus
          />
          {showSuggestions && (
            <AutocompleteSuggestions
              ref={suggestionsRef}
              query={inputValue}
              onSelect={handleSuggestionSelect}
              visible={showSuggestions}
              focusedIndex={focusedSuggestionIndex}
              lastOperator={lastOperator}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="formula-input-container" ref={containerRef}>
      <div className="formula-input-wrapper">
        {renderFormulaDisplay()}
      </div>
      
      <div className="formula-actions">
        <button 
          className="calculate-button"
          onClick={handleCalculateClick}
          disabled={formula.length === 0}
        >
          Calculate
        </button>
      </div>
      
      {result !== null && (
        <div className="formula-result">
          Result: <span className="result-value">{result}</span>
        </div>
      )}
      
      <div className="formula-instructions">
        <p>Tips:</p>
        <ul>
          <li>Type variable names or numbers</li>
          <li>Use +, -, *, /, ^, (, ) for operations</li>
          <li>Press Enter to add variables or numbers</li>
          <li>Press Backspace to remove tokens</li>
          <li>Click on a tag to position cursor</li>
          <li>Each tag has a dropdown menu (click the arrow)</li>
        </ul>
      </div>
    </div>
  );
};

export default FormulaInput;