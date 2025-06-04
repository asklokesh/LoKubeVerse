import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './components/App'
// import Debug from './debug'
import './index.css'
import { authService } from './services/api'
import toast from 'react-hot-toast'

console.log('main.jsx starting execution');

// Get environment variables with defaults
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true'
const SKIP_AUTHENTICATION = import.meta.env.VITE_SKIP_AUTHENTICATION === 'true'
const API_URL = import.meta.env.VITE_API_URL || window.location.origin

console.log('Environment:', {
  DEV_MODE,
  SKIP_AUTHENTICATION,
  API_URL
});

// Auto-login in development mode if enabled
if (DEV_MODE && SKIP_AUTHENTICATION && !authService.isAuthenticated()) {
  console.log('Development mode: Auto-login enabled')
  
  // Attempt auto-login with demo credentials
  authService.login('demo@k8sdash.com', 'demo123')
    .then(() => {
      console.log('Auto-login successful')
    })
    .catch(error => {
      console.error('Auto-login failed:', error)
      toast.error('Auto-login failed. Please login manually.')
    })
}

// Show a loading message directly in the DOM to help debug blank page issues
const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.innerHTML = '<div style="padding: 20px; font-family: Arial; text-align: center;"><h1>Loading K8s-Dash...</h1><p>If this message persists, check the browser console for errors.</p></div>';
}

// Render application
const renderApp = () => {
  try {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <BrowserRouter basename="/">
          <App />
        </BrowserRouter>
      </React.StrictMode>,
    )
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
    document.getElementById('root').innerHTML = `
      <div style="padding: 20px; font-family: Arial; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #e53e3e">Error Rendering K8s Dash</h1>
        <p>There was an error rendering the application. Details below:</p>
        <pre style="background: #f7fafc; padding: 15px; border-radius: 5px; overflow: auto;">${error.message}\n\n${error.stack}</pre>
        
        <h2 style="margin-top: 20px;">Environment Information</h2>
        <ul>
          <li>DEV_MODE: ${DEV_MODE}</li>
          <li>SKIP_AUTHENTICATION: ${SKIP_AUTHENTICATION}</li>
          <li>API_URL: ${API_URL}</li>
        </ul>
        
        <h2 style="margin-top: 20px;">Troubleshooting</h2>
        <ol>
          <li>Check browser console for more detailed errors</li>
          <li>Verify that environment variables are correctly set</li>
          <li>Ensure all dependencies are installed</li>
          <li>Try clearing browser cache and reload</li>
        </ol>
      </div>
    `;
  }
};

// Execute render with a small delay to ensure DOM is ready
setTimeout(renderApp, 100); 