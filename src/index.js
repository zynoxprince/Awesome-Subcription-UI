// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import global styles FIRST
import App from './App'; // Import the main App component
import './App.css';     // Import component-specific styles AFTER global

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);