import React, { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import IntegrationRequestForm from "@/components/IntegrationRequestForm";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Activity, Users, Briefcase, MapPin, MessageSquare, Bell,
  ShieldCheck, KeyRound, Cpu, Send, Plus, Loader2, ExternalLink, Mail,
} from "lucide-react";

/**
 * The Architect Dashboard — superuser-only overview + control tower.
 *
 * Gated to admin role. Shows live platform metrics, the Apex Vault status,
 * a synthetic 6-engine self-test button, the User CRUD table, and the
 * Integration Request outreach flow.
 */
export default function ArchitectDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [vault, setVault] = useState(null);
  const [users, setUsers] = useState([]);
  const [engineTest, setEngineTest] = useState(null);
  const [testing, setTesting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);

  async function loadAll() {
    try {
      const [m, v, u, ir] = await Promise.all([
        api.get("/architect/metrics"),
        api.get("/architect/vault/status"),
        api.get("/architect/users"),
        api.get("/integration-requests"),
      ]);
      setMetrics(m.data);
      setVault(v.data);
      setUsers(u.data || []);
      setRequests(ir.data || []);
    } catch (err) {
      console.error("Architect load failed:", err);
    }
  }

  useEffect(() => {
    loadAll();
    const t = setInterval(loadAll, 15000); // refresh every 15s for a "live" feel
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runEngineTest() {
    setTesting(true);
    try {
      const r = await api.post("/architect/engines/self-test");
      setEngineTest(r.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTesting(false);
    }
  }

  return (
    <AppLayout
      title={`The Architect · ${user?.name || ""}`}
      subtitle="Superuser control tower — live metrics, vault status, engine health, user oversight, and agency outreach."
      actions={
        <button
          data-testid="architect-request-integration"
          onClick={() => setShowForm(true)}
          className="haven-btn btn-gold rounded-full px-4 py-2 text-xs font-medium inline-flex items-center gap-1.5"
        >
          <Plus size={13} /> Request agency integration
        </button>
      }
    >
      {/* METRICS GRID */}
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6" data-testid="architect-metrics">
        <Metric icon={Users}       label="Users"          value={metrics?.users?.total} sub={`${metrics?.users?.residents ?? 0} residents`} />
        <Metric icon={Briefcase}   label="Open cases"     value={metrics?.cases?.open}  sub={`${metrics?.cases?.urgent ?? 0} urgent`} accent="rose" />
        <Metric icon={MapPin}      label="Resources"      value={metrics?.resources?.total} />
        <Metric icon={MessageSquare} label="Messages"    value={metrics?.messages?.total} />
        <Metric icon={Bell}        label="BB sessions"    value={metrics?.bb_sessions} />
        <Metric icon={Send}        label="Integrations"   value={metrics?.integration_requests} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* APEX VAULT + ENGINE SELF-TEST */}
        <div className="space-y-4">
          <div className="haven-card p-5" data-testid="apex-vault-card">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-[#d4af37]" />
              <h3 className="font-display text-lg font-medium">Apex Vault</h3>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-emerald-400">● operational</span>
            </div>
            {vault && (
              <dl className="space-y-1.5 text-xs">
                <Row k="Cipher" v={vault.algo} />
                <Row k="KDF" v={vault.kdf} />
                <Row k="Envelope" v={vault.envelope} />
                <Row k="Integrity" v={vault.integrity_check} />
                <Row k="Master key" v={vault.master_key_configured ? `configured (${vault.master_key_source})` : "MISSING"} />
              </dl>
            )}
            <p className="mt-3 text-[11px] text-[#aab5cf]">Auto-encrypts: {vault?.supported_fields?.join(", ")}</p>
          </div>

          <div className="haven-card p-5" data-testid="engine-test-card">
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={16} className="text-[#d4af37]" />
              <h3 className="font-display text-lg font-medium">Six engines · self-test</h3>
            </div>
            <p className="text-xs text-[#aab5cf] mb-3">Runs a synthetic resident intake through FirstResponse Router → QualifyCore → NexusMatch → CivicFlow → CascadePipeline.</p>
            <button
              onClick={runEngineTest}
              disabled={testing}
              data-testid="run-engine-test"
              className="haven-btn text-xs font-medium px-3 py-1.5 rounded-full border border-[#d4af37]/40 text-[#f1d36b] hover:bg-[#d4af37]/10 inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {testing ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />}
              {testing ? "Running…" : "Run self-test"}
            </button>
            {engineTest && (
              <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 p-3 text-xs">
                <p className="text-emerald-300 font-medium">✓ Pipeline OK in {engineTest.elapsed_ms} ms</p>
                <p className="text-zinc-300 mt-1">Crisis level: <strong>{engineTest.crisis_level}</strong> · {engineTest.history_events} events emitted</p>
              </div>
            )}
          </div>
        </div>

        {/* USER MANAGEMENT */}
        <div className="haven-card p-5 lg:col-span-2" data-testid="architect-users">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-[#d4af37]" />
            <h3 className="font-display text-lg font-medium">Users</h3>
            <span className="ml-auto text-[10px] uppercase tracking-wider text-[#6d7a9a]">{users.length} total</span>
          </div>
          <div className="overflow-x-auto max-h-[420px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-[#6d7a9a] text-left border-b border-[var(--haven-border)]">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} data-testid={`user-row-${u.id}`} className="border-b border-[var(--haven-border)]/60 hover:bg-[#142244]/40">
                    <td className="py-2 pr-3 text-zinc-100">{u.name}</td>
                    <td className="py-2 pr-3 text-[#aab5cf]">{u.email}</td>
                    <td className="py-2 pr-3">
                      <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        u.role === "admin" ? "bg-[#d4af37]/15 text-[#f1d36b]" :
                        u.role === "caseworker" ? "bg-blue-500/15 text-blue-300" :
                        "bg-emerald-500/10 text-emerald-300"
                      }`}>{u.role}</span>
                    </td>
                    <td className="py-2 pr-3 text-zinc-500 text-xs">{u.phone || "—"}</td>
                    <td className="py-2">
                      <span className={`text-[10px] uppercase tracking-wider ${u.disabled ? "text-rose-400" : "text-emerald-400"}`}>
                        {u.disabled ? "disabled" : "active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* INTEGRATION REQUESTS */}
      <section className="haven-card p-5 mt-6" data-testid="integration-requests-panel">
        <div className="flex items-center gap-2 mb-3">
          <Send size={16} className="text-[#d4af37]" />
          <h3 className="font-display text-lg font-medium">Agency integration requests</h3>
          <span className="ml-auto text-[10px] uppercase tracking-wider text-[#6d7a9a]">{requests.length} outreach</span>
        </div>
        {requests.length === 0 && (
          <p className="text-xs text-[#aab5cf] py-4">No requests yet. Click <em>Request agency integration</em> above to draft your first DPA.</p>
        )}
        {requests.length > 0 && (
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="rounded-lg border border-[var(--haven-border)] bg-[#0a142b]/60 p-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-zinc-100">{r.agency_name}</p>
                    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      r.status === "active" ? "bg-emerald-500/15 text-emerald-300" :
                      r.status === "drafted" ? "bg-amber-500/15 text-amber-300" : "bg-zinc-700/40 text-zinc-300"
                    }`}>{r.status}</span>
                    <span className="text-[10px] uppercase tracking-wider text-[#6d7a9a]">{r.agency_type}</span>
                  </div>
                  <p className="text-xs text-[#aab5cf] mt-1">{r.program}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{r.contacts?.length} contact(s) · {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <a href={r.document_url} target="_blank" rel="noreferrer" className="text-[11px] text-[#f1d36b] hover:underline inline-flex items-center gap-1">
                    Document <ExternalLink size={10} />
                  </a>
                  <a href={r.mailto_url} className="text-[11px] text-[#f1d36b] hover:underline inline-flex items-center gap-1">
                    <Mail size={10} /> Send to chain of command
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <IntegrationRequestForm
          onClose={() => setShowForm(false)}
          onCreated={() => loadAll()}
        />
      )}
    </AppLayout>
  );
}

function Metric({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="haven-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#6d7a9a]">
        <Icon size={11} className={accent === "rose" ? "text-rose-300" : "text-[#d4af37]"} />
        {label}
      </div>
      <p className={`font-display text-2xl font-semibold mt-1 ${accent === "rose" ? "text-rose-200" : "text-zinc-100"}`}>
        {value ?? "—"}
      </p>
      {sub && <p className="text-[10px] text-[#aab5cf] mt-0.5">{sub}</p>}
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-[#6d7a9a]">{k}</dt>
      <dd className="text-zinc-100 text-right truncate">{v}</dd>
    </div>
  );
}
