import React from 'react';
import ReactDOM from 'react-dom/client';
import { ContentScriptComponent } from './ContentScriptComponent';

const container = document.createElement('div');
document.body.appendChild(container);

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <ContentScriptComponent />
  </React.StrictMode>
);
