import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import BookPage from "@/pages/BookPage";
import CrisisPage from "@/pages/CrisisPage";
import ResourcesPage from "@/pages/ResourcesPage";
import CaseworkerDashboard from "@/pages/CaseworkerDashboard";
import CaseDetailPage from "@/pages/CaseDetailPage";
import FormBuilderPage from "@/pages/FormBuilderPage";
import BBBrowserControlPage from "@/pages/BBBrowserControlPage";
import ResidentDashboard from "@/pages/ResidentDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

import "@/App.css";

function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

function RoleHome() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/crisis" element={<CrisisPage />} />
            <Route path="/resources" element={<ResourcesPage />} />

            <Route path="/app" element={<RoleHome />} />

            <Route path="/caseworker" element={<Protected roles={["caseworker", "admin"]}><CaseworkerDashboard /></Protected>} />
            <Route path="/caseworker/cases/:id" element={<Protected roles={["caseworker", "admin"]}><CaseDetailPage /></Protected>} />
            <Route path="/caseworker/forms" element={<Protected roles={["caseworker", "admin"]}><FormBuilderPage /></Protected>} />
            <Route path="/caseworker/bb-browser" element={<Protected roles={["caseworker", "admin"]}><BBBrowserControlPage /></Protected>} />

            <Route path="/resident" element={<Protected roles={["resident"]}><ResidentDashboard /></Protected>} />
            <Route path="/admin" element={<Protected roles={["admin"]}><AdminDashboard /></Protected>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster theme="dark" position="bottom-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
