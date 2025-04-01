import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FormulaInput from './components/FormulaInput/FormulaInput';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <header className="app-header">
          <h1>Formula Input Component</h1>
          <p>Enter a formula using variables, numbers, and operations</p>
        </header>
        
        <main className="app-main">
          <FormulaInput />
        </main>
        
        <footer className="app-footer">
          <p>Similar to Causal Formula Input Implementation</p>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;