import React from 'react';
import { createRoot } from 'react-dom/client';
import { ContentScriptComponent } from './ContentScriptComponent';

const mountNode = document.createElement('div');
document.body.appendChild(mountNode);
const root = createRoot(mountNode);
root.render(<ContentScriptComponent />);