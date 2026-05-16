// في artifacts/store/src/main.tsx
import './lib/api-config'; // أضف هذا السطر في البداية
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
