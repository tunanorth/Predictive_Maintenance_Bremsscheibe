import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { ReactQueryProvider } from '@/lib/react-query';
import { ThemeProvider } from '@/context/theme';
import { ScenarioProvider } from '@/context/scenario';
import { AuthProvider } from '@/context/auth';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Initialize theme from localStorage or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.classList.remove('dark', 'light');
document.documentElement.classList.add(savedTheme);
if (savedTheme === 'dark') {
  document.body.classList.add('bg-[#0A0A0A]');
} else {
  document.body.classList.add('bg-[#FAFAFA]');
}

console.log('Main.tsx: Starting React app');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
  throw new Error('Root element not found');
}

console.log('Root element found, rendering app...');

ReactDOM.createRoot(rootElement).render(
  <ErrorBoundary>
    <ThemeProvider>
      <AuthProvider>
        <ScenarioProvider>
          <ReactQueryProvider>
            <App />
          </ReactQueryProvider>
        </ScenarioProvider>
      </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

