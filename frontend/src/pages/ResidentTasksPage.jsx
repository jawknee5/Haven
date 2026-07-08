import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { ListChecks, CheckCircle2, Clock3, AlertOctagon } from "lucide-react";

const STATUS_TONE = {
  open: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  in_progress: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  done: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

const PRIORITY_TONE = {
  low: "text-slate-300",
  medium: "text-amber-300",
  high: "text-orange-300",
  urgent: "text-rose-300",
};

export default function ResidentTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const c = await api.get("/cases");
      setCases(c.data || []);
      // residents: fetch tasks per case (since /tasks endpoint scopes to caseworker)
      const allTasks = [];
      for (const caseDoc of (c.data || [])) {
        try {
          const t = await api.get(`/cases/${caseDoc.id}`);
          (t.data?.tasks || []).forEach((tk) => allTasks.push({ ...tk, _case_title: caseDoc.title }));
        } catch (e) { console.warn(`Failed to load tasks for case ${caseDoc.id}:`, e); }
      }
      setTasks(allTasks);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function markDone(task) {
    try {
      // residents can't update tasks server-side, but show optimistic + send message instead
      toast.info("Marking complete… your caseworker will be notified.");
      const caseId = task.case_id;
      await api.post("/messages", { case_id: caseId, content: `Hi, I've completed: "${task.title}". Please review.` });
      setTasks((cur) => cur.map((t) => (t.id === task.id ? { ...t, status: "done" } : t)));
    } catch (e) { toast.error("Couldn't send notification"); }
  }

  const filtered = useMemo(() => tasks.filter((t) => filter === "all" ? true : t.status === filter), [tasks, filter]);

  const counts = {
    open: tasks.filter((t) => t.status === "open").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <AppLayout title="My Tasks" subtitle="Small steps, one at a time. Your caseworker assigned these to move things forward.">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="haven-card p-4"><div className="flex items-center gap-2 text-amber-300"><Clock3 size={14} /><p className="text-[10px] uppercase">To do</p></div><p className="font-display text-2xl mt-1">{counts.open}</p></div>
        <div className="haven-card p-4"><div className="flex items-center gap-2 text-blue-300"><ListChecks size={14} /><p className="text-[10px] uppercase">In progress</p></div><p className="font-display text-2xl mt-1">{counts.in_progress}</p></div>
        <div className="haven-card p-4"><div className="flex items-center gap-2 text-emerald-300"><CheckCircle2 size={14} /><p className="text-[10px] uppercase">Done</p></div><p className="font-display text-2xl mt-1">{counts.done}</p></div>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {["all", "open", "in_progress", "done"].map((f) => (
          <button key={f} data-testid={`task-filter-${f}`} onClick={() => setFilter(f)} className={`text-xs px-3 py-1 rounded-full border haven-btn capitalize ${filter === f ? "bg-[#d4af37]/15 border-[#d4af37]/40 text-[#f1d36b]" : "border-[#1d2c4f] text-[#aab5cf]"}`}>{f.replace("_", " ")}</button>
        ))}
      </div>
      {loading && <div className="grid gap-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl shimmer" />)}</div>}
      <div className="space-y-3">
        {filtered.map((t) => (
          <div key={t.id} data-testid={`task-${t.id}`} className="haven-card p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#142244]/60 border border-[#1d2c4f] flex items-center justify-center shrink-0">
              {t.status === "done" ? <CheckCircle2 className="text-emerald-300" size={16} /> : <ListChecks className="text-[#aab5cf]" size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium">{t.title}</p>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_TONE[t.status]}`}>{t.status.replace("_", " ")}</span>
                <span className={`text-[10px] uppercase tracking-wider ${PRIORITY_TONE[t.priority]}`}>{t.priority}</span>
              </div>
              <p className="text-sm text-[#aab5cf] mt-1">{t.description || "—"}</p>
              <p className="text-[10px] text-zinc-500 mt-1">Case: {t._case_title}</p>
            </div>
            {t.status !== "done" && (
              <button data-testid={`task-done-${t.id}`} onClick={() => markDone(t)} className="haven-btn text-xs px-3 py-1 rounded-full btn-gold shrink-0">Mark complete</button>
            )}
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="text-center text-zinc-500 py-12 haven-card">
            <ListChecks size={28} className="mx-auto text-[#aab5cf] mb-2" />
            No tasks here — you're all caught up.
          </div>
        )}
      </div>
    </AppLayout>
  );
}
