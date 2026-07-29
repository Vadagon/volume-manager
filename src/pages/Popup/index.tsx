import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './popup.scss';

const container = document.getElementById('popup');
if (container) createRoot(container).render(<App />);
