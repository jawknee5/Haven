import { createBrowserRouter, Navigate } from 'react-router-dom';
import ResourceMap from '../modules/ResourceMap/ResourceMap';
import AppShell from './AppShell';

// Placeholder route components - replace with actual implementations
const Dashboard = () => <ResourceMap />;
const HAVEN = () => <div>HAVEN</div>;
const Resources = () => <div>Resources</div>;
const Tools = () => <div>Tools</div>;
const Pack = () => <div>Pack</div>;
const Profile = () => <div>Profile</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'navigation', element: <HAVEN /> },
      { path: 'resources', element: <Resources /> },
      { path: 'tools', element: <Tools /> },
      { path: 'pack', element: <Pack /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
]);
