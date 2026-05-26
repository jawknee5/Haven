import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import BBChat from "@/components/BBChat";
import AgencySubmitPanel from "@/components/AgencySubmitPanel";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowLeft,
  FileText,
  ListTodo,
  MessageSquare,
  Upload,
  CheckCircle2,
  Plus,
  Send,
  Loader2,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

const URGENCY_COLOR = (u) => (u >= 80 ? "rose" : u >= 60 ? "amber" : "emerald");

function StatusPill({ status }) {
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full status-${status}`}>{status}</span>;
}

function TasksPanel({ caseId, tasks, refresh }) {
  const [t, setT] = useState({ title: "", priority: "medium" });
  const [busy, setBusy] = useState(false);
  async function add() {
    if (!t.title.trim()) return;
    setBusy(true);
    try {
      await api.post("/tasks", { case_id: caseId, title: t.title, priority: t.priority });
      setT({ title: "", priority: "medium" });
      await refresh();
    } finally {
      setBusy(false);
    }
  }
  async function toggle(task) {
    await api.patch(`/tasks/${task.id}`, { status: task.status === "done" ? "open" : "done" });
    await refresh();
  }
  return (
    <div className="haven-card p-5" data-testid="tasks-panel">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-medium flex items-center gap-2"><ListTodo size={16} className="text-blue-300" /> Tasks</h3>
        <span className="text-xs text-zinc-500">{tasks.filter((x) => x.status !== "done").length} open</span>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700">
            <button
              data-testid={`toggle-task-${task.id}`}
              onClick={() => toggle(task)}
              className="w-5 h-5 rounded-md border border-zinc-600 flex items-center justify-center hover:border-emerald-400"
            >
              {task.status === "done" && <CheckCircle2 size={14} className="text-emerald-400" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${task.status === "done" ? "line-through text-zinc-500" : ""}`}>{task.title}</p>
              <p className="text-[10px] text-zinc-500 capitalize">{task.priority} priority</p>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-xs text-zinc-500 px-2 py-4">No tasks yet.</p>}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          data-testid="new-task-input"
          value={t.title}
          onChange={(e) => setT({ ...t, title: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a task…"
          className="flex-1 bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/60"
        />
        <select
          value={t.priority}
          onChange={(e) => setT({ ...t, priority: e.target.value })}
          className="bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-2 text-sm"
        >
          <option value="low">Low</option>
          <option value="medium">Med</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <button
          data-testid="add-task-btn"
          onClick={add}
          disabled={busy}
          className="haven-btn h-9 px-3 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-sm flex items-center gap-1"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function MessagesPanel({ caseId, messages, refresh }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  async function send() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await api.post("/messages", { case_id: caseId, content: text });
      setText("");
      await refresh();
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="haven-card p-5 flex flex-col" data-testid="messages-panel" style={{ minHeight: 340 }}>
      <h3 className="font-display font-medium flex items-center gap-2 mb-3"><MessageSquare size={16} className="text-blue-300" /> Secure messages</h3>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-72">
        {messages.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "flex-row-reverse" : ""} gap-2`}>
              <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center text-xs">
                {(m.sender_name?.[0] || "U").toUpperCase()}
              </div>
              <div
                className={`text-sm leading-relaxed rounded-2xl px-3 py-2 max-w-[80%] ${
                  mine ? "bg-blue-500/15 border border-blue-500/30 text-blue-50 rounded-tr-sm" : "bg-zinc-800/60 border border-zinc-700/50 rounded-tl-sm"
                }`}
              >
                <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">{m.sender_name}</p>
                {m.content}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && <p className="text-xs text-zinc-500 px-2 py-4">No messages yet.</p>}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          data-testid="message-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message…"
          className="flex-1 bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/60"
        />
        <button
          data-testid="send-message-btn"
          onClick={send}
          disabled={busy}
          className="haven-btn h-9 px-3 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-sm flex items-center gap-1"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

function DocsPanel({ caseId, docs, refresh }) {
  const [busy, setBusy] = useState(false);
  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("case_id", caseId);
    fd.append("type", "other");
    fd.append("file", file);
    try {
      await api.post("/documents", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await refresh();
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }
  async function verify(id, v) {
    await api.patch(`/documents/${id}/verify?verified=${v}`);
    await refresh();
  }
  return (
    <div className="haven-card p-5" data-testid="docs-panel">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-medium flex items-center gap-2"><FileText size={16} className="text-blue-300" /> Documents</h3>
        <label className="haven-btn inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-zinc-700/70 cursor-pointer hover:bg-zinc-800/50">
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          Upload
          <input data-testid="doc-upload-input" type="file" className="hidden" onChange={upload} />
        </label>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {docs.map((d) => (
          <div key={d.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700">
            <FileText size={14} className="text-zinc-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{d.filename}</p>
              <p className="text-[10px] text-zinc-500">
                {Math.round(d.size / 1024)} KB · <span className="capitalize">{d.type}</span>
              </p>
            </div>
            {d.verified ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5">
                <ShieldCheck size={10} /> Verified
              </span>
            ) : (
              <button
                data-testid={`verify-doc-${d.id}`}
                onClick={() => verify(d.id, true)}
                className="text-[10px] text-zinc-300 border border-zinc-700 rounded-full px-2 py-0.5 hover:bg-zinc-800"
              >
                Mark verified
              </button>
            )}
          </div>
        ))}
        {docs.length === 0 && <p className="text-xs text-zinc-500 px-2 py-4">No documents yet.</p>}
      </div>
    </div>
  );
}

export default function CaseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);

  async function load() {
    const r = await api.get(`/cases/${id}`);
    setData(r.data);
    setLoading(false);
  }
  useEffect(() => {
    load().catch(() => navigate("/caseworker"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !data) {
    return (
      <AppLayout title="Loading…">
        <div className="h-24 shimmer rounded-lg" />
      </AppLayout>
    );
  }

  const c = data.case;
  const u = URGENCY_COLOR(c.urgency_score);

  async function setStatus(s) {
    setSavingStatus(true);
    try {
      await api.patch(`/cases/${id}`, { status: s });
      await load();
    } finally {
      setSavingStatus(false);
    }
  }

  async function claim() {
    await api.post(`/cases/${id}/claim`);
    await load();
  }

  return (
    <AppLayout
      title={c.title}
      subtitle={`Resident: ${c.resident_name} · ${c.category} · case ${c.id.slice(0, 8)}`}
      actions={
        <>
          <Link to="/caseworker" className="haven-btn inline-flex items-center gap-1 text-sm text-zinc-300 hover:text-white">
            <ArrowLeft size={14} /> Back
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          {/* Case header */}
          <div className="haven-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <StatusPill status={c.status} />
                  <span className={`text-[10px] px-2 py-0.5 rounded-full bg-${u}-500/15 text-${u}-300 border border-${u}-500/30`}>
                    Urgency {c.urgency_score}
                  </span>
                  <span className="text-[10px] text-zinc-500 capitalize">{c.category}</span>
                </div>
                <p className="text-sm text-zinc-300 mt-3 leading-relaxed max-w-3xl">{c.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!c.caseworker_id && (
                  <button data-testid="claim-case-btn" onClick={claim} className="haven-btn text-sm px-3 py-1.5 rounded-full bg-blue-500 hover:bg-blue-400 text-white">
                    Claim case
                  </button>
                )}
                <select
                  data-testid="case-status-select"
                  value={c.status}
                  disabled={savingStatus}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-zinc-900/60 border border-zinc-700/60 rounded-full text-sm px-3 py-1.5"
                >
                  <option value="new">new</option>
                  <option value="enriched">enriched</option>
                  <option value="routed">routed</option>
                  <option value="active">active</option>
                  <option value="resolved">resolved</option>
                  <option value="closed">closed</option>
                </select>
              </div>
            </div>

            {/* Intake summary grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {Object.entries(c.intake_data || {}).map(([k, v]) => (
                <div key={k} className="bg-zinc-900/40 border border-zinc-800 rounded-lg px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">{k.replace(/_/g, " ")}</p>
                  <p className="text-sm truncate">{String(v) || "—"}</p>
                </div>
              ))}
            </div>

            {c.urgency_score >= 85 && (
              <div className="mt-4 flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2 text-rose-200 text-sm">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <p>High-urgency case. Recommend immediate outreach within 4 hours. BB can draft a message for you.</p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <TasksPanel caseId={c.id} tasks={data.tasks} refresh={load} />
            <DocsPanel caseId={c.id} docs={data.documents} refresh={load} />
          </div>

          <AgencySubmitPanel caseData={c} />

          <MessagesPanel caseId={c.id} messages={data.messages} refresh={load} />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <div className="sticky top-24">
            <BBChat
              sessionId={`bb-case-${c.id}`}
              contextLabel={`Case ${c.id.slice(0, 8)}`}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
