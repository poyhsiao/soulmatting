import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

/**
 * Main Application Component
 *
 * Provides routing configuration and global providers for the SoulMatting application.
 * Includes routes for home, authentication, and other core pages.
 *
 * @version 1.0.0
 * @created 2024-01-20
 * @updated 2024-01-20
 * @author Kim Hsiao
 */
function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className='App'>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            {/* Placeholder routes for navigation links */}
            <Route
              path='/about'
              element={<div>About Page - Coming Soon</div>}
            />
            <Route
              path='/features'
              element={<div>Features Page - Coming Soon</div>}
            />
            <Route
              path='/pricing'
              element={<div>Pricing Page - Coming Soon</div>}
            />
            <Route
              path='/upload'
              element={<div>Upload Page - Coming Soon</div>}
            />
            <Route path='/demo' element={<div>Demo Page - Coming Soon</div>} />
            <Route
              path='/forgot-password'
              element={<div>Forgot Password Page - Coming Soon</div>}
            />
            {/* Catch-all route for 404 */}
            <Route path='*' element={<div>Page Not Found</div>} />
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
