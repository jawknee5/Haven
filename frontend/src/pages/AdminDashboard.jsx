import React, { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import ResourceMapWidget from "@/components/ResourceMapWidget";
import BBChat from "@/components/BBChat";
import { Users, Briefcase, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";

function Card({ label, value, icon: Icon, tone = "blue" }) {
  const toneMap = {
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  };
  return (
    <div className="haven-card p-4">
      <div className={`w-9 h-9 rounded-lg border inline-flex items-center justify-center ${toneMap[tone]}`}>
        <Icon size={16} />
      </div>
      <p className="font-display text-2xl font-semibold mt-3">{value}</p>
      <p className="text-xs text-zinc-500 mt-1">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/analytics/admin").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <AppLayout title="Admin Console" subtitle="System health, user management, and capacity at a glance.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card label="Total users" value={stats?.total_users ?? "—"} icon={Users} tone="blue" />
        <Card label="Caseworkers" value={stats?.caseworkers ?? "—"} icon={Briefcase} tone="violet" />
        <Card label="Active cases" value={stats?.active_cases ?? "—"} icon={ShieldCheck} tone="amber" />
        <Card label="Resources" value={stats?.total_resources ?? "—"} icon={MapPin} tone="emerald" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-7 space-y-4">
          <div className="haven-card p-5">
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-blue-400">System</p>
            <h2 className="font-display text-xl font-semibold mt-1">Operational snapshot</h2>
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                <p className="text-[10px] uppercase tracking-wider text-emerald-300">API</p>
                <p className="text-sm font-medium mt-1">All systems normal</p>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                <p className="text-[10px] uppercase tracking-wider text-emerald-300">BB AI</p>
                <p className="text-sm font-medium mt-1">BB · Local Ollama AI</p>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                <p className="text-[10px] uppercase tracking-wider text-emerald-300">Browser Engine</p>
                <p className="text-sm font-medium mt-1">Playwright ready</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4">Audit logs, integrations, and access controls coming online next.</p>
          </div>
          <ResourceMapWidget height={320} />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <BBChat sessionId={`bb-admin-${user?.id}`} contextLabel="Admin" compact />
        </div>
      </div>
    </AppLayout>
  );
}
