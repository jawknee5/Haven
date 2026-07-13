import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home/Home';
import ResourceMapPage from './pages/ResourceMap/ResourceMapPage';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Admin from './pages/Admin';
import BbChat from './pages/BbChat';
import Pathway from './pages/Pathway/Pathway';
import Resources from './pages/Resources/Resources';
import Tools from './pages/Tools/Tools';
import Pack from './pages/Pack/Pack';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import FormTemplatesPage from './pages/FormTemplates/FormTemplatesPage';
import CurriculumPage from './pages/Curriculum/CurriculumPage';

const router = createBrowserRouter([
  { path: '/login',             element: <Login /> },
  { path: '/',                  element: <Home /> },
  { path: '/resources/map',     element: <ResourceMapPage /> },
  { path: '/dashboard',         element: <Dashboard /> },
  { path: '/admin',             element: <Admin /> },
  { path: '/chat',              element: <BbChat /> },
  { path: '/pathway',           element: <Pathway /> },
  { path: '/resources',         element: <Resources /> },
  { path: '/tools',             element: <Tools /> },
  { path: '/pack',              element: <Pack /> },
  { path: '/profile',           element: <Profile /> },
  { path: '/settings',          element: <Settings /> },
  { path: '/forms/templates',   element: <FormTemplatesPage /> },
  { path: '/onboarding',        element: <CurriculumPage /> },
]);

export const AppRouter = () => <RouterProvider router={router} />;
