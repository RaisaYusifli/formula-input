import { create } from "zustand";

const VARIABLE_VALUES = {
  revenue: 1000,
  cost: 500,
  profit: 500,
  growth: 0.2,
  customers: 100,
  conversion: 0.05,
  cac: 50,
  ltv: 200,
  churn: 0.1,
  mrr: 100,
};

const evaluateExpression = (tokens) => {
  const expressionString = tokens
    .map((token) => {
      switch (token.type) {
        case "number":
          return token.value;
        case "operator":
          if (token.value === "^") return "**";
          return token.value;
        case "variable":
          const variableName = token.value.toLowerCase();
          if (VARIABLE_VALUES.hasOwnProperty(variableName)) {
            return VARIABLE_VALUES[variableName];
          }
          console.warn(`Variable not found: ${token.value}`);
          return 0;
        default:
          return "";
      }
    })
    .join(" ");

  try {
    return new Function(`return ${expressionString}`)();
  } catch (error) {
    console.error("Error evaluating expression:", error);
    return "Error";
  }
};

export const useFormulaStore = create((set, get) => ({
  formula: [],
  cursorPosition: 0,
  inputValue: "",
  history: [],
  historyIndex: -1,

  setFormula: (formula) => set({ formula }),

  setCursorPosition: (position) => {
    const { formula } = get();
    const validPosition = Math.max(0, Math.min(position, formula.length));
    set({ cursorPosition: validPosition });
  },

  setInputValue: (value) => set({ inputValue: value }),

  addToken: (token) => {
    const { formula, cursorPosition } = get();
    const newFormula = [
      ...formula.slice(0, cursorPosition),
      token,
      ...formula.slice(cursorPosition),
    ];

    get().saveToHistory();

    set({
      formula: newFormula,
      cursorPosition: cursorPosition + 1,
      inputValue: "",
    });
  },

  removeToken: () => {
    const { formula, cursorPosition } = get();

    if (cursorPosition > 0) {
      get().saveToHistory();

      const newFormula = [
        ...formula.slice(0, cursorPosition - 1),
        ...formula.slice(cursorPosition),
      ];

      set({
        formula: newFormula,
        cursorPosition: cursorPosition - 1,
      });
    }
  },

  addOperator: (operator) => {
    const { formula, cursorPosition } = get();

    get().saveToHistory();

    const newFormula = [
      ...formula.slice(0, cursorPosition),
      { type: "operator", value: operator },
      ...formula.slice(cursorPosition),
    ];

    set({
      formula: newFormula,
      cursorPosition: cursorPosition + 1,
      inputValue: "",
    });
  },

  processInput: () => {
    const { inputValue } = get();
    if (!inputValue.trim()) return;
    get().saveToHistory();

    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue.toString() === inputValue.trim()) {
      get().addToken({ type: "number", value: numValue });
    } else {
      get().addToken({ type: "variable", value: inputValue.trim() });
    }
  },

  saveToHistory: () => {
    const { formula, history, historyIndex } = get();
    const formulaCopy = JSON.parse(JSON.stringify(formula));

    const newHistory =
      historyIndex < history.length - 1
        ? history.slice(0, historyIndex + 1)
        : history;

    set({
      history: [...newHistory, formulaCopy],
      historyIndex: newHistory.length,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();

    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevFormula = history[prevIndex];

      set({
        formula: prevFormula,
        historyIndex: prevIndex,
        cursorPosition: Math.min(get().cursorPosition, prevFormula.length),
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();

    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextFormula = history[nextIndex];

      set({
        formula: nextFormula,
        historyIndex: nextIndex,
        cursorPosition: Math.min(get().cursorPosition, nextFormula.length),
      });
    }
  },

  updateToken: (index, newToken) => {
    const { formula } = get();

    if (index >= 0 && index < formula.length) {
      get().saveToHistory();

      const newFormula = [...formula];
      newFormula[index] = newToken;

      set({ formula: newFormula });
    }
  },

  removeTokenAtIndex: (index) => {
    const { formula, cursorPosition } = get();

    if (index >= 0 && index < formula.length) {
      get().saveToHistory();

      const newFormula = [
        ...formula.slice(0, index),
        ...formula.slice(index + 1),
      ];

      const newPosition =
        index < cursorPosition ? cursorPosition - 1 : cursorPosition;

      set({
        formula: newFormula,
        cursorPosition: Math.max(0, newPosition),
      });
    }
  },

  calculateResult: () => {
    const { formula } = get();

    if (formula.length === 0) {
      return 0;
    }

    try {
      return evaluateExpression(formula);
    } catch (error) {
      console.error("Error calculating result:", error);
      return "Error";
    }
  },

  isFormulaValid: () => {
    const { formula } = get();

    if (formula.length === 0) {
      return false;
    }

    if (formula[0].type === "operator" && !["("].includes(formula[0].value)) {
      return false;
    }

    if (
      formula[formula.length - 1].type === "operator" &&
      ![")"].includes(formula[formula.length - 1].value)
    ) {
      return false;
    }
    let parenCount = 0;
    for (const token of formula) {
      if (token.type === "operator") {
        if (token.value === "(") parenCount++;
        if (token.value === ")") parenCount--;

        if (parenCount < 0) return false;
      }
    }

    return parenCount === 0;
  },
}));
