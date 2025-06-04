import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { Toaster } from 'react-hot-toast';
import Login from './Login';
import Dashboard from './Dashboard';
import Layout from './Layout';
import Clusters from './Clusters';
import Workloads from './Workloads';
import Deployments from './Deployments';
import Monitoring from './Monitoring';
import CostAnalysis from './CostAnalysis';
import Users from './Users';
import NotFound from './NotFound';

// Development mode flags
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';
const SKIP_AUTH = import.meta.env.VITE_SKIP_AUTHENTICATION === 'true';

console.log('App.jsx loading');
console.log('Environment variables:', {
  DEV_MODE,
  SKIP_AUTH,
  API_URL: import.meta.env.VITE_API_URL
});

const App = () => {
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('App mounted, auth status:', authService.isAuthenticated());
    
    // If we have a token but no user, try to get the user profile
    if (localStorage.getItem('token') && !localStorage.getItem('user')) {
      authService.getProfile()
        .then(response => {
          localStorage.setItem('user', JSON.stringify(response.data));
        })
        .catch(err => {
          console.error('Failed to get user profile:', err);
        });
    }
    
    setInitialized(true);
  }, []);

  // Redirect to login if not authenticated
  const RequireAuth = ({ children }) => {
    console.log('RequireAuth check', { DEV_MODE, SKIP_AUTH, isAuth: authService.isAuthenticated() });
    
    // In development mode with SKIP_AUTH, bypass authentication check
    if (DEV_MODE && SKIP_AUTH) {
      return children;
    }
    
    if (!authService.isAuthenticated()) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  };

  // Redirect to dashboard if already authenticated
  const RedirectIfAuth = ({ children }) => {
    console.log('RedirectIfAuth check', { DEV_MODE, SKIP_AUTH, isAuth: authService.isAuthenticated() });
    
    // In development mode with SKIP_AUTH, always redirect to dashboard
    if (DEV_MODE && SKIP_AUTH) {
      return <Navigate to="/dashboard" replace />;
    }
    
    if (authService.isAuthenticated()) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  if (!initialized) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>;
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
        
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clusters" element={<Clusters />} />
          <Route path="workloads" element={<Workloads />} />
          <Route path="deployments" element={<Deployments />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="costs" element={<CostAnalysis />} />
          <Route path="users" element={<Users />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App; 