import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Every route renders the same <App /> — it reads useLocation()/useParams()
// internally to decide what to show. This gives real, shareable, back/
// forward-friendly URLs without requiring App() to be split into
// per-route components first.
const ROUTE_PATHS = [
  '/',
  '/category/:categoryId',
  '/thread/:threadId',
  '/thread/:threadId/edit',
  '/new',
  '/profile',
  '/u/:userId',
  '/messages',
  '/messages/:userId',
  '/settings',
  '/admin',
  '/articles',
  '/rules',
  '*',
];

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {ROUTE_PATHS.map((path) => (
            <Route key={path} path={path} element={<App />} />
          ))}
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
