import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";

import BBDemoPage from "@/pages/BBDemoPage";
import IntroAnimation from "@/pages/IntroAnimation";
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
import AdminUsersPage from "@/pages/AdminUsersPage";
import AdminAuditPage from "@/pages/AdminAuditPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import ResidentTasksPage from "@/pages/ResidentTasksPage";
import ResidentDocumentsPage from "@/pages/ResidentDocumentsPage";
import ApplicationsPage from "@/pages/ApplicationsPage";
import MessagesPage from "@/pages/MessagesPage";
import SurvivalBiblePage from "@/pages/SurvivalBiblePage";
import CampingPage from "@/pages/CampingPage";
import ArchitectDashboard from "@/pages/ArchitectDashboard";

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
            <Route path="/" element={<LoginPage />} />
            <Route path="/intro" element={<IntroAnimation autoNavigate />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/demo" element={<BBDemoPage />} />
            <Route path="/crisis" element={<CrisisPage />} />
            <Route path="/resources" element={<ResourcesPage />} />

            <Route path="/app" element={<RoleHome />} />

            <Route path="/caseworker" element={<Protected roles={["caseworker", "admin"]}><CaseworkerDashboard /></Protected>} />
            <Route path="/caseworker/cases/:id" element={<Protected roles={["caseworker", "admin"]}><CaseDetailPage /></Protected>} />
            <Route path="/caseworker/forms" element={<Protected roles={["caseworker", "admin"]}><FormBuilderPage /></Protected>} />
            <Route path="/caseworker/bb-browser" element={<Protected roles={["caseworker", "admin"]}><BBBrowserControlPage /></Protected>} />
            <Route path="/caseworker/integrations" element={<Protected roles={["caseworker", "admin"]}><IntegrationsPage /></Protected>} />

            <Route path="/resident" element={<Protected roles={["resident"]}><ResidentDashboard /></Protected>} />
            <Route path="/resident/tasks" element={<Protected roles={["resident"]}><ResidentTasksPage /></Protected>} />
            <Route path="/resident/documents" element={<Protected roles={["resident"]}><ResidentDocumentsPage /></Protected>} />
            <Route path="/resident/applications" element={<Protected roles={["resident", "caseworker", "admin"]}><ApplicationsPage /></Protected>} />
            <Route path="/resident/messages" element={<Protected roles={["resident", "caseworker", "admin"]}><MessagesPage /></Protected>} />
            <Route path="/survival-bible" element={<Protected roles={["resident", "caseworker", "admin"]}><SurvivalBiblePage /></Protected>} />
            <Route path="/camping" element={<Protected roles={["resident", "caseworker", "admin"]}><CampingPage /></Protected>} />
            <Route path="/architect" element={<Protected roles={["architect"]}><ArchitectDashboard /></Protected>} />

            <Route path="/admin" element={<Protected roles={["admin"]}><AdminDashboard /></Protected>} />
            <Route path="/admin/users" element={<Protected roles={["admin"]}><AdminUsersPage /></Protected>} />
            <Route path="/admin/integrations" element={<Protected roles={["admin"]}><IntegrationsPage adminMode /></Protected>} />
            <Route path="/admin/audit" element={<Protected roles={["admin"]}><AdminAuditPage /></Protected>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster theme="dark" position="bottom-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
