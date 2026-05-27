import React, { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import api from "@/lib/api";
import {
  Plus,
  Trash2,
  Save,
  GripVertical,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";

const FIELD_TYPES = [
  { v: "text", l: "Short text" },
  { v: "textarea", l: "Long text" },
  { v: "email", l: "Email" },
  { v: "phone", l: "Phone" },
  { v: "number", l: "Number" },
  { v: "date", l: "Date" },
  { v: "select", l: "Dropdown" },
  { v: "radio", l: "Radio (single)" },
  { v: "checkbox", l: "Checkbox (multi)" },
  { v: "file", l: "File upload" },
];

function newField() {
  return {
    id: crypto.randomUUID(),
    label: "New field",
    type: "text",
    name: `field_${Math.random().toString(36).slice(2, 7)}`,
    placeholder: "",
    required: false,
    options: [],
    helper_text: "",
    map_to: "",
  };
}

export default function FormBuilderPage() {
  const [forms, setForms] = useState([]);
  const [active, setActive] = useState(null);
  const [busy, setBusy] = useState(false);
  const [previewData, setPreviewData] = useState({});

  async function load() {
    const r = await api.get("/forms");
    setForms(r.data || []);
    if (!active && r.data?.[0]) setActive(r.data[0]);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createNew() {
    setBusy(true);
    try {
      const r = await api.post("/forms", {
        name: "Untitled form",
        description: "",
        category: "intake",
        fields: [newField()],
      });
      await load();
      setActive(r.data);
    } finally {
      setBusy(false);
    }
  }

  function update(patch) {
    setActive((f) => ({ ...f, ...patch }));
  }

  function updateField(id, patch) {
    setActive((f) => ({
      ...f,
      fields: f.fields.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  }

  function move(id, dir) {
    setActive((f) => {
      const idx = f.fields.findIndex((x) => x.id === id);
      const j = idx + dir;
      if (idx < 0 || j < 0 || j >= f.fields.length) return f;
      const next = [...f.fields];
      const [item] = next.splice(idx, 1);
      next.splice(j, 0, item);
      return { ...f, fields: next };
    });
  }

  async function save() {
    setBusy(true);
    try {
      const r = await api.patch(`/forms/${active.id}`, {
        name: active.name,
        description: active.description,
        category: active.category,
        fields: active.fields,
        published: active.published,
      });
      setActive(r.data);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!active || !window.confirm("Delete this form?")) return;
    await api.delete(`/forms/${active.id}`);
    setActive(null);
    await load();
  }

  return (
    <AppLayout
      title="Form Builder"
      subtitle="Recreate any agency form. BB will autofill submissions from resident profiles."
      actions={
        <button
          data-testid="create-form-btn"
          onClick={createNew}
          className="haven-btn inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-blue-500 hover:bg-blue-400 text-white"
        >
          <Plus size={14} /> New form
        </button>
      }
    >
      <div className="grid grid-cols-12 gap-5">
        {/* Forms list */}
        <aside className="col-span-12 lg:col-span-3">
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-zinc-500 mb-2">Library</p>
          <div className="space-y-2">
            {forms.map((f) => (
              <button
                key={f.id}
                data-testid={`form-${f.id}`}
                onClick={() => setActive(f)}
                className={`w-full text-left haven-btn px-3 py-2.5 rounded-lg border ${
                  active?.id === f.id ? "bg-blue-500/10 border-blue-500/40" : "border-zinc-800 hover:bg-zinc-900/50"
                }`}
              >
                <p className="text-sm font-medium truncate">{f.name}</p>
                <p className="text-[10px] text-zinc-500 capitalize">
                  {f.category} · {f.fields?.length || 0} fields
                </p>
              </button>
            ))}
            {forms.length === 0 && <p className="text-xs text-zinc-500">No forms yet.</p>}
          </div>
        </aside>

        {/* Editor */}
        <section className="col-span-12 lg:col-span-6">
          {!active ? (
            <div className="haven-card p-10 text-center text-zinc-500 text-sm">
              <FileSpreadsheet size={28} className="mx-auto text-zinc-700 mb-3" />
              Pick a form on the left or create a new one.
            </div>
          ) : (
            <div className="haven-card p-5 space-y-4" data-testid="form-editor">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400">Form name</label>
                  <input
                    value={active.name}
                    onChange={(e) => update({ name: e.target.value })}
                    className="w-full mt-1 bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/60"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Category</label>
                  <select
                    value={active.category}
                    onChange={(e) => update({ category: e.target.value })}
                    className="w-full mt-1 bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm"
                  >
                    <option>intake</option>
                    <option>housing</option>
                    <option>benefits</option>
                    <option>health</option>
                    <option>employment</option>
                    <option>legal</option>
                    <option>other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400">Description</label>
                <textarea
                  value={active.description}
                  onChange={(e) => update({ description: e.target.value })}
                  rows={2}
                  className="w-full mt-1 bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/60"
                />
              </div>

              <div className="space-y-3 pt-2">
                {active.fields.map((f, idx) => (
                  <div key={f.id} className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/40" data-testid={`field-${f.id}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <GripVertical size={14} className="text-zinc-600" />
                      <button onClick={() => move(f.id, -1)} className="haven-btn text-zinc-500 hover:text-zinc-200">
                        <ChevronUp size={14} />
                      </button>
                      <button onClick={() => move(f.id, 1)} className="haven-btn text-zinc-500 hover:text-zinc-200">
                        <ChevronDown size={14} />
                      </button>
                      <span className="text-[10px] text-zinc-500 font-mono">#{idx + 1}</span>
                      <button
                        onClick={() => update({ fields: active.fields.filter((x) => x.id !== f.id) })}
                        className="haven-btn ml-auto text-zinc-500 hover:text-rose-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input
                        value={f.label}
                        onChange={(e) => updateField(f.id, { label: e.target.value })}
                        placeholder="Label"
                        className="bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-2 py-1.5 text-sm"
                      />
                      <select
                        value={f.type}
                        onChange={(e) => updateField(f.id, { type: e.target.value })}
                        className="bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-2 py-1.5 text-sm"
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t.v} value={t.v}>
                            {t.l}
                          </option>
                        ))}
                      </select>
                      <input
                        value={f.name}
                        onChange={(e) => updateField(f.id, { name: e.target.value })}
                        placeholder="name (kebab/snake)"
                        className="bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-2 py-1.5 text-sm font-mono"
                      />
                      <input
                        value={f.placeholder || ""}
                        onChange={(e) => updateField(f.id, { placeholder: e.target.value })}
                        placeholder="Placeholder"
                        className="bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-2 py-1.5 text-sm"
                      />
                      {(f.type === "select" || f.type === "radio" || f.type === "checkbox") && (
                        <input
                          value={(f.options || []).join(", ")}
                          onChange={(e) => updateField(f.id, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                          placeholder="Options (comma separated)"
                          className="bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-2 py-1.5 text-sm sm:col-span-2"
                        />
                      )}
                      <input
                        value={f.helper_text || ""}
                        onChange={(e) => updateField(f.id, { helper_text: e.target.value })}
                        placeholder="Helper text"
                        className="bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-2 py-1.5 text-sm sm:col-span-2"
                      />
                      <label className="flex items-center gap-2 text-xs text-zinc-300 sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={!!f.required}
                          onChange={(e) => updateField(f.id, { required: e.target.checked })}
                        />{" "}
                        Required
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  data-testid="add-field-btn"
                  onClick={() => update({ fields: [...active.fields, newField()] })}
                  className="haven-btn w-full py-2 rounded-lg border border-dashed border-zinc-700/60 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 inline-flex items-center justify-center gap-2 text-sm"
                >
                  <Plus size={14} /> Add field
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  data-testid="save-form-btn"
                  onClick={save}
                  disabled={busy}
                  className="haven-btn inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-blue-500 hover:bg-blue-400 text-white"
                >
                  <Save size={14} /> Save
                </button>
                <button
                  data-testid="delete-form-btn"
                  onClick={remove}
                  className="haven-btn text-xs px-3 py-1.5 rounded-full border border-zinc-700/60 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Live preview */}
        <section className="col-span-12 lg:col-span-3">
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-zinc-500 mb-2">Live preview</p>
          {active ? (
            <div className="haven-card p-4 space-y-3" data-testid="form-preview">
              <p className="font-display font-medium">{active.name}</p>
              {active.description && <p className="text-xs text-zinc-400">{active.description}</p>}
              {active.fields.map((f) => (
                <div key={f.id}>
                  <label className="text-xs text-zinc-300">
                    {f.label} {f.required && <span className="text-rose-400">*</span>}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      rows={3}
                      placeholder={f.placeholder}
                      value={previewData[f.name] || ""}
                      onChange={(e) => setPreviewData({ ...previewData, [f.name]: e.target.value })}
                      className="w-full mt-1 bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-2 py-1.5 text-sm"
                    />
                  ) : f.type === "select" ? (
                    <select
                      value={previewData[f.name] || ""}
                      onChange={(e) => setPreviewData({ ...previewData, [f.name]: e.target.value })}
                      className="w-full mt-1 bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-2 py-1.5 text-sm"
                    >
                      <option value="">Select…</option>
                      {(f.options || []).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type === "phone" ? "tel" : f.type}
                      placeholder={f.placeholder}
                      value={previewData[f.name] || ""}
                      onChange={(e) => setPreviewData({ ...previewData, [f.name]: e.target.value })}
                      className="w-full mt-1 bg-zinc-900/60 border border-zinc-700/60 rounded-lg px-2 py-1.5 text-sm"
                    />
                  )}
                  {f.helper_text && <p className="text-[10px] text-zinc-500 mt-0.5">{f.helper_text}</p>}
                </div>
              ))}
              <p className="text-[10px] text-zinc-500 mt-2 inline-flex items-center gap-1">
                <Sparkles size={10} /> BB can auto-fill this form using resident profile data.
              </p>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">Pick a form to preview.</p>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
