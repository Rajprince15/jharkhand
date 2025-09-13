import React from 'react';
import ReactDOM from 'react-dom/client';
import { DemoApp } from './examples';
import './index.css';

// Demo page to showcase all examples
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DemoApp />
  </React.StrictMode>
);
