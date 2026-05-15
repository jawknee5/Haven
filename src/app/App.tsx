import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AppShell from './AppShell';
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Pathway from '../pages/Pathway/Pathway';
import Resources from '../pages/Resources/Resources';
import Housing from '../pages/Housing/Housing';
import Tools from '../pages/Tools/Tools';
import Pack from '../pages/Pack/Pack';
import Profile from '../pages/Profile/Profile';

const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const hasAuth = localStorage.getItem('auth_token');
  return hasAuth ? element : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <ProtectedRoute element={<Dashboard />} /> },
      { path: 'dashboard', element: <ProtectedRoute element={<Dashboard />} /> },
      { path: 'pathway', element: <ProtectedRoute element={<Pathway />} /> },
      { path: 'resources', element: <ProtectedRoute element={<Resources />} /> },
      { path: 'housing', element: <ProtectedRoute element={<Housing />} /> },
      { path: 'survival-bible', element: <ProtectedRoute element={<Tools />} /> },
      { path: 'pack', element: <ProtectedRoute element={<Pack />} /> },
      { path: 'profile', element: <ProtectedRoute element={<Profile />} /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <div style={{ background: '#0D0F12', minHeight: '100vh' }} />;
  }

  return <RouterProvider router={router} />;
}
