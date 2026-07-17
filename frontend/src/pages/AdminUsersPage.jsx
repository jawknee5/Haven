import React, { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import api from "@/lib/api";
import { toast } from "sonner";
import { Users, UserPlus, Shield, Mail, Search, Pencil } from "lucide-react";

const ROLE_TONE = {
  resident: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  caseworker: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  admin: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "resident", phone: "", password: "Demo2026!" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", role: "resident", phone: "" });

  async function load() {
    setLoading(true);
    try {
      const r = await api.get("/admin/users", { params: { q: q || undefined, role: role || undefined } });
      setUsers(r.data || []);
    } catch (e) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post("/admin/users", form);
      toast.success(`Created ${form.email}`);
      setForm({ email: "", name: "", role: "resident", phone: "", password: "Demo2026!" });
      setCreating(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to create user");
    }
  }

  function startEdit(u) {
    setEditingId(u.id);
    setEditForm({ name: u.name, role: u.role, phone: u.phone || "" });
  }

  async function saveEdit(id) {
    try {
      await api.patch(`/admin/users/${id}`, editForm);
      toast.success("User updated");
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to update user");
    }
  }

  return (
    <AppLayout title="User Management" subtitle="Provision residents, caseworkers, and administrators.">
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-[#6d7a9a]" />
          <input data-testid="user-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name/email…" className="bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:border-[#d4af37]/60 w-56" />
        </div>
        <select data-testid="role-filter" value={role} onChange={(e) => setRole(e.target.value)} className="bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-1.5 text-sm focus:outline-none">
          <option value="">All roles</option>
          <option value="resident">Resident</option>
          <option value="caseworker">Caseworker</option>
          <option value="admin">Admin</option>
        </select>
        <button data-testid="apply-filters" onClick={load} className="haven-btn text-sm px-4 py-1.5 rounded-full btn-outline-navy">Apply</button>
        <button data-testid="new-user-btn" onClick={() => setCreating((v) => !v)} className="haven-btn inline-flex items-center gap-1 text-sm px-4 py-1.5 rounded-full btn-gold ml-auto">
          <UserPlus size={14} /> New user
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="haven-card p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input data-testid="new-email" required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2 text-sm" />
          <input data-testid="new-name" required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2 text-sm" />
          <select data-testid="new-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2 text-sm">
            <option value="resident">Resident</option>
            <option value="caseworker">Caseworker</option>
            <option value="admin">Admin</option>
          </select>
          <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Initial password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2 text-sm" />
          <button data-testid="create-user-submit" type="submit" className="haven-btn btn-gold rounded-lg px-4 py-2 text-sm">Create</button>
        </form>
      )}

      <div className="haven-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0a142b]/70 text-[10px] uppercase tracking-wider text-[#aab5cf]">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Phone</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="5" className="px-4 py-6 text-center text-[#aab5cf]">Loading users…</td></tr>
            )}
            {!loading && users.map((u) => (
              <tr key={u.id} className="border-t border-[var(--haven-border)] hover:bg-[#0d1a36]/40">
                <td className="px-4 py-3">
                  {editingId === u.id ? (
                    <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-[#0a142b]/70 border border-[#1d2c4f] rounded px-2 py-1 text-sm w-full" />
                  ) : (
                    <span className="font-medium">{u.name}</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-[#aab5cf]"><span className="inline-flex items-center gap-1"><Mail size={11} /> {u.email}</span></td>
                <td className="px-4 py-3">
                  {editingId === u.id ? (
                    <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="bg-[#0a142b]/70 border border-[#1d2c4f] rounded px-2 py-1 text-sm">
                      <option value="resident">Resident</option>
                      <option value="caseworker">Caseworker</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${ROLE_TONE[u.role]}`}>{u.role}</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-[#aab5cf]">{u.phone || "—"}</td>
                <td className="px-4 py-3 text-right">
                  {editingId === u.id ? (
                    <div className="inline-flex gap-2">
                      <button data-testid={`save-${u.id}`} onClick={() => saveEdit(u.id)} className="haven-btn text-xs px-3 py-1 rounded-full btn-gold">Save</button>
                      <button onClick={() => setEditingId(null)} className="haven-btn text-xs px-3 py-1 rounded-full btn-outline-navy">Cancel</button>
                    </div>
                  ) : (
                    <button data-testid={`edit-${u.id}`} onClick={() => startEdit(u)} className="haven-btn inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full btn-outline-navy"><Pencil size={11} /> Edit</button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-[#aab5cf]">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
