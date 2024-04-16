import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Popup from './Popup';
import { createRoot } from 'react-dom/client';

// import hotreload from '../../utils/hotreload';
// hotreload();

const container = document.getElementById('popup');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
  root.render(<Popup />);
});
