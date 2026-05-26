import React, { useEffect, useRef, useState } from "react";
import AppLayout from "@/components/AppLayout";
import api from "@/lib/api";
import { toast } from "sonner";
import { Folder, Upload, FileCheck2, FileText, ShieldCheck, AlertTriangle } from "lucide-react";

export default function ResidentDocumentsPage() {
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("identity");
  const fileRef = useRef(null);

  useEffect(() => {
    api.get("/cases").then((r) => {
      setCases(r.data || []);
      if (r.data?.length) setActiveCase(r.data[0]);
    });
  }, []);

  useEffect(() => {
    if (activeCase) {
      api.get(`/documents?case_id=${activeCase.id}`).then((r) => setDocs(r.data || []));
    }
  }, [activeCase]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!activeCase) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("case_id", activeCase.id);
      fd.append("type", docType);
      fd.append("file", file);
      await api.post("/documents", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`Uploaded ${file.name}`);
      const r = await api.get(`/documents?case_id=${activeCase.id}`);
      setDocs(r.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <AppLayout title="Document Locker" subtitle="Encrypted storage for your ID, income, residency, and medical docs.">
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-4 haven-card p-4">
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37]">Your cases</p>
          <ul className="mt-3 space-y-1">
            {cases.map((c) => (
              <li key={c.id}>
                <button data-testid={`select-case-${c.id}`} onClick={() => setActiveCase(c)} className={`w-full text-left px-3 py-2 rounded-lg border haven-btn ${activeCase?.id === c.id ? "bg-[#d4af37]/10 border-[#d4af37]/40 text-[#f1d36b]" : "border-[#1d2c4f] hover:bg-[#142244]/50"}`}>
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <p className="text-[11px] text-[#aab5cf] capitalize">{c.category} · {c.status}</p>
                </button>
              </li>
            ))}
            {cases.length === 0 && <li className="text-sm text-zinc-500">No cases yet.</li>}
          </ul>
        </div>

        <div className="col-span-12 md:col-span-8">
          {activeCase && (
            <>
              <div className="haven-card p-4 mb-4 flex flex-wrap items-end gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#aab5cf]">Document type</p>
                  <select data-testid="doc-type" value={docType} onChange={(e) => setDocType(e.target.value)} className="mt-1 bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2 text-sm">
                    <option value="identity">Identity (ID, passport)</option>
                    <option value="income">Income (pay stub, SSI letter)</option>
                    <option value="residency">Residency (lease, utility)</option>
                    <option value="medical">Medical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <input ref={fileRef} type="file" hidden onChange={handleUpload} data-testid="doc-file-input" />
                <button data-testid="doc-upload-btn" disabled={uploading} onClick={() => fileRef.current?.click()} className="haven-btn inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full btn-gold disabled:opacity-50">
                  <Upload size={14} /> {uploading ? "Uploading…" : "Upload document"}
                </button>
                <p className="text-[11px] text-[#aab5cf] ml-auto">8MB max. Encrypted at rest.</p>
              </div>
              <div className="grid gap-3">
                {docs.map((d) => (
                  <div key={d.id} className="haven-card p-3 flex items-center gap-3" data-testid={`doc-${d.id}`}>
                    <div className="w-10 h-10 rounded-lg bg-[#142244]/60 border border-[#1d2c4f] flex items-center justify-center"><FileText size={16} className="text-[#aab5cf]" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{d.filename}</p>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">{d.type}</span>
                        {d.verified ? (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1"><ShieldCheck size={10} /> Verified</span>
                        ) : (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1"><AlertTriangle size={10} /> Pending review</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#aab5cf] mt-0.5">{(d.size / 1024).toFixed(0)} KB · {new Date(d.created_at).toLocaleString()}</p>
                    </div>
                    {d.data_url && (
                      <a data-testid={`doc-view-${d.id}`} href={d.data_url} target="_blank" rel="noreferrer" className="haven-btn text-xs px-3 py-1 rounded-full btn-outline-navy">View</a>
                    )}
                  </div>
                ))}
                {docs.length === 0 && (
                  <div className="haven-card p-8 text-center text-zinc-500">
                    <Folder size={28} className="mx-auto text-[#aab5cf] mb-2" />
                    No documents uploaded yet for this case.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
