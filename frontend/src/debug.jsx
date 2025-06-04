import React, { useEffect, useState } from 'react';

const Debug = () => {
  const [envVars, setEnvVars] = useState({});
  const [apiStatus, setApiStatus] = useState('checking...');
  const [localStorage, setLocalStorage] = useState({});
  const [errorLogs, setErrorLogs] = useState([]);

  useEffect(() => {
    // Get environment variables
    setEnvVars({
      DEV_MODE: import.meta.env.VITE_DEV_MODE,
      SKIP_AUTHENTICATION: import.meta.env.VITE_SKIP_AUTHENTICATION,
      API_URL: import.meta.env.VITE_API_URL,
      NODE_ENV: import.meta.env.NODE_ENV,
      BASE_URL: import.meta.env.BASE_URL,
    });

    // Check localStorage
    try {
      const keys = ['token', 'user'];
      const storage = {};
      
      keys.forEach(key => {
        const value = window.localStorage.getItem(key);
        storage[key] = value ? (key === 'user' ? JSON.parse(value) : value) : 'not set';
      });
      
      setLocalStorage(storage);
    } catch (err) {
      console.error('Error accessing localStorage:', err);
      setErrorLogs(prev => [...prev, `localStorage error: ${err.message}`]);
    }

    // Check API connection
    const checkApi = async () => {
      try {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/health`;
        const response = await fetch(url);
        
        if (response.ok) {
          setApiStatus(`Connected (${response.status})`);
        } else {
          setApiStatus(`Error: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.error('API connection error:', err);
        setApiStatus(`Failed: ${err.message}`);
        setErrorLogs(prev => [...prev, `API connection error: ${err.message}`]);
      }
    };

    checkApi();

    // Capture console errors
    const originalError = console.error;
    console.error = (...args) => {
      setErrorLogs(prev => [...prev, args.join(' ')]);
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#3182ce' }}>K8s Dash Diagnostics Page</h1>
      <p>This page shows diagnostic information to help troubleshoot issues with the K8s Dash application.</p>

      <section style={{ marginTop: '20px', padding: '15px', background: '#f7fafc', borderRadius: '5px' }}>
        <h2>Environment Variables</h2>
        <pre style={{ background: '#edf2f7', padding: '10px', overflowX: 'auto' }}>
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </section>

      <section style={{ marginTop: '20px', padding: '15px', background: '#f7fafc', borderRadius: '5px' }}>
        <h2>API Connection</h2>
        <p>Status: <strong>{apiStatus}</strong></p>
        <button 
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/docs`}
          style={{ 
            padding: '8px 16px', 
            background: '#4299e1', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Open API Docs
        </button>
      </section>

      <section style={{ marginTop: '20px', padding: '15px', background: '#f7fafc', borderRadius: '5px' }}>
        <h2>Local Storage</h2>
        <pre style={{ background: '#edf2f7', padding: '10px', overflowX: 'auto' }}>
          {JSON.stringify(localStorage, null, 2)}
        </pre>
      </section>

      <section style={{ marginTop: '20px', padding: '15px', background: '#f7fafc', borderRadius: '5px' }}>
        <h2>Error Logs</h2>
        {errorLogs.length > 0 ? (
          <ul style={{ background: '#fed7d7', padding: '10px', borderRadius: '4px' }}>
            {errorLogs.map((log, index) => (
              <li key={index} style={{ marginBottom: '5px' }}>{log}</li>
            ))}
          </ul>
        ) : (
          <p>No errors logged</p>
        )}
      </section>

      <section style={{ marginTop: '20px', padding: '15px', background: '#f7fafc', borderRadius: '5px' }}>
        <h2>Troubleshooting</h2>
        <ul>
          <li>Check that all services are running in Docker Compose</li>
          <li>Verify environment variables are correctly set</li>
          <li>Check browser console for JavaScript errors</li>
          <li>Clear browser cache and cookies</li>
          <li>Try accessing the API directly</li>
        </ul>
      </section>

      <section style={{ marginTop: '20px', padding: '15px', background: '#f7fafc', borderRadius: '5px' }}>
        <h2>Navigation</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => window.location.href = '/'}
            style={{ 
              padding: '8px 16px', 
              background: '#4299e1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go to App
          </button>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              padding: '8px 16px', 
              background: '#48bb78', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{ 
              padding: '8px 16px', 
              background: '#ed8936', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Storage & Refresh
          </button>
        </div>
      </section>
    </div>
  );
};

export default Debug; 