import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import BBChat from "@/components/BBChat";
import ResourceMapWidget from "@/components/ResourceMapWidget";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { getTodaysDrill } from "@/data/quickDrills";
import CaseNumberWidget from "@/components/CaseNumberWidget";
import {
  MessageSquare, ListChecks, MapPin, CalendarClock, ArrowRight, LifeBuoy,
  Folder, Send, Bell, ShieldCheck, CheckCircle2, AlertTriangle, BookOpen, Sparkles,
} from "lucide-react";

function StepCard({ n, title, body, href, status }) {
  return (
    <Link to={href} data-testid={`step-${n}`} className="haven-card p-5 hover:border-[#d4af37]/40 transition haven-btn block">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-[#d4af37]/80">{n}</p>
        {status === "done" && <CheckCircle2 size={14} className="text-emerald-300" />}
        {status === "current" && <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />}
      </div>
      <h3 className="font-display font-medium mt-1">{title}</h3>
      <p className="text-sm text-[#aab5cf] mt-1 leading-relaxed">{body}</p>
      <p className="text-xs text-[#d4af37] mt-3 inline-flex items-center gap-1">Continue <ArrowRight size={11} /></p>
    </Link>
  );
}

export default function ResidentDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [notifications, setNotifications] = useState({ unread: 0, items: [] });
  const [applications, setApplications] = useState([]);
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get("/cases"),
      api.get("/notifications"),
      api.get("/integrations/submissions"),
    ]).then(([c, n, a]) => {
      setCases(c.data || []);
      setNotifications(n.data || { unread: 0, items: [] });
      setApplications(a.data || []);
    }).catch((err) => console.error("Failed to load resident dashboard:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const counts = (notifications.items || []).filter((i) => i.kind === "task").length;
    setTaskCount(counts);
  }, [notifications]);

  const activeCase = cases[0];
  const pendingApps = applications.filter((a) => a.status !== "approved" && a.status !== "denied").length;

  return (
    <AppLayout
      title={`Welcome, ${user?.name?.split(" ")[0] || "there"}.`}
      subtitle="You're in the right place. Take a breath — we'll go step by step."
      actions={
        <Link to="/crisis" data-testid="crisis-btn" className="haven-btn inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border border-rose-500/30 text-rose-300 hover:bg-rose-500/10">
          <LifeBuoy size={14} /> I need help now
        </Link>
      }
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-7 space-y-6">
          <section>
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37]">Your roadmap</p>
            <h2 className="font-display text-2xl font-semibold mt-1">Where you are right now</h2>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <StepCard n="01" title="Tell us what's happening" body="Answer a few simple questions about your situation." href="/resident/messages" status={cases.length > 0 ? "done" : "current"} />
              <StepCard n="02" title="Upload your documents" body="Add ID, income, and residency proof to your locker." href="/resident/documents" status={cases.length > 0 ? "current" : ""} />
              <StepCard n="03" title="Track your applications" body="See real-time status of every agency request." href="/resident/applications" status={applications.length > 0 ? "current" : ""} />
            </div>
          </section>

          {/* At-a-glance counters */}
          <section className="grid sm:grid-cols-4 gap-3">
            <Link to="/resident/tasks" data-testid="r-stat-tasks" className="haven-card p-3 hover:border-[#d4af37]/40 haven-btn">
              <div className="flex items-center gap-2 text-amber-300"><ListChecks size={14} /><p className="text-[10px] uppercase">Tasks</p></div>
              <p className="font-display text-xl mt-1">{taskCount}</p>
            </Link>
            <Link to="/resident/documents" data-testid="r-stat-docs" className="haven-card p-3 hover:border-[#d4af37]/40 haven-btn">
              <div className="flex items-center gap-2 text-violet-300"><Folder size={14} /><p className="text-[10px] uppercase">Documents</p></div>
              <p className="font-display text-xl mt-1">{cases.length}</p>
              <p className="text-[10px] text-zinc-500">case lockers</p>
            </Link>
            <Link to="/resident/applications" data-testid="r-stat-apps" className="haven-card p-3 hover:border-[#d4af37]/40 haven-btn">
              <div className="flex items-center gap-2 text-blue-300"><Send size={14} /><p className="text-[10px] uppercase">Applications</p></div>
              <p className="font-display text-xl mt-1">{applications.length}</p>
              <p className="text-[10px] text-zinc-500">{pendingApps} pending</p>
            </Link>
            <Link to="/resident/messages" data-testid="r-stat-msgs" className="haven-card p-3 hover:border-[#d4af37]/40 haven-btn">
              <div className="flex items-center gap-2 text-emerald-300"><MessageSquare size={14} /><p className="text-[10px] uppercase">Messages</p></div>
              <p className="font-display text-xl mt-1">{notifications.items?.filter((i) => i.kind === "message").length || 0}</p>
            </Link>
          </section>

          {activeCase && (
            <section className="haven-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37]">Your current case</p>
                  <h3 className="font-display text-lg font-semibold mt-1">{activeCase.title}</h3>
                </div>
                <Link to="/resident/applications" className="haven-btn text-xs px-3 py-1 rounded-full btn-outline-navy">View progress</Link>
              </div>
              <p className="text-sm text-[#aab5cf] mt-2 leading-relaxed">{activeCase.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <span className={`status-${activeCase.status} px-2 py-0.5 rounded-full uppercase tracking-wider text-[10px]`}>{activeCase.status}</span>
                <span className="text-zinc-500">Caseworker: <span className="text-zinc-200">{activeCase.caseworker_name || "Not yet assigned"}</span></span>
              </div>
            </section>
          )}

          {notifications.items?.length > 0 && (
            <section className="haven-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-amber-300" />
                  <h3 className="font-display font-medium">Recent updates</h3>
                </div>
                <span className="text-xs text-zinc-500">{notifications.items.length}</span>
              </div>
              <ul className="space-y-2">
                {notifications.items.slice(0, 6).map((n) => (
                  <li key={n.id}>
                    <Link to={n.link} data-testid={`notif-${n.id}`} className="flex items-start gap-3 px-3 py-2 rounded-lg border border-[var(--haven-border)] hover:bg-[#142244]/40 haven-btn">
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#142244] text-[#aab5cf] shrink-0 mt-0.5">{n.kind}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-[11px] text-[#aab5cf] truncate">{n.body}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <ResourceMapWidget height={300} />
          <CaseNumberWidget />
          <QuickDrillCard />
          <BBChat sessionId={`bb-res-${user?.id}`} contextLabel="Resident" compact />
        </div>
      </div>
    </AppLayout>
  );
}

function QuickDrillCard() {
  const drill = getTodaysDrill();
  const href = `/survival-bible?askbb=1&ask=${encodeURIComponent(drill.ask)}`;
  return (
    <Link
      to={href}
      data-testid="bb-quick-drill-card"
      className="haven-card p-4 block hover:border-[#d4af37]/45 transition haven-btn relative overflow-hidden"
    >
      <div
        className="absolute -right-6 -top-6 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle at center, rgba(241,211,107,0.18), transparent 70%)" }}
      />
      <div className="flex items-center gap-2 mb-1 relative">
        <Sparkles size={13} className="text-[#d4af37]" />
        <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37]">
          Today&apos;s BB Drill
        </p>
      </div>
      <p className="font-display text-base font-medium text-zinc-100 relative">{drill.title}</p>
      <p className="mt-2 text-xs text-[#aab5cf] inline-flex items-center gap-1 relative">
        <BookOpen size={11} /> Learn it with BB <ArrowRight size={11} />
      </p>
    </Link>
  );
}
