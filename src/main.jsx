import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';
import { setupGlobalErrorHandlers } from '@/lib/globalErrorHandler';

// Setup global error handlers before app starts
setupGlobalErrorHandlers();

// NOTE: React.StrictMode intentionally removed.
// In React 18, StrictMode double-invokes effects (mount → unmount → remount) in
// development AND production builds. This causes visit-duration tracking to record
// near-zero session times because session-start effects fire twice and the first
// "end" event fires before the real session begins. It also fires beforeunload /
// visibilitychange listeners prematurely, making analytics platforms believe users
// bounced immediately. Remove StrictMode to get accurate visit duration data.
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);