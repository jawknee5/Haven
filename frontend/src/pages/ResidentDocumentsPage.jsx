import React, { useEffect, useRef, useState } from "react";
import AppLayout from "@/components/AppLayout";
import api from "@/lib/api";
import { toast } from "sonner";
import { Folder, Upload, FileText, ShieldCheck, AlertTriangle, ScanLine, Sparkles, Loader2, KeyRound, X } from "lucide-react";

const CATEGORY_LABELS = {
  identity: "Identity",
  social_security: "Social Security",
  birth_certificate: "Birth Certificate",
  medical: "Medical",
  benefits: "Benefits",
  housing: "Housing",
  income: "Income",
  legal: "Legal",
  other: "Other",
  residency: "Residency",
};

function CategoryBadge({ type }) {
  return (
    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
      {CATEGORY_LABELS[type] || type}
    </span>
  );
}

function ExtractedDataModal({ doc, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/documents/${doc.id}/extracted`)
      .then((r) => setData(r.data))
      .catch((e) => setError(e?.response?.data?.detail || "Could not decrypt"));
  }, [doc.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" data-testid="extracted-modal">
      <div className="haven-card w-full max-w-lg max-h-[80vh] overflow-y-auto p-5 relative">
        <button data-testid="extracted-modal-close" onClick={onClose} className="absolute top-3 right-3 text-[#aab5cf] hover:text-white"><X size={16} /></button>
        <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37] flex items-center gap-2">
          <KeyRound size={12} /> Apex Vault — Decrypted extraction
        </p>
        <p className="text-sm font-medium mt-1 truncate">{doc.filename}</p>
        {!data && !error && <p className="text-sm text-[#aab5cf] mt-4 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Decrypting…</p>}
        {error && <p className="text-sm text-rose-300 mt-4">{error}</p>}
        {data && (
          <div className="mt-4 space-y-4">
            {data.key_fields && Object.keys(data.key_fields).length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#aab5cf] mb-1">Key fields</p>
                <div className="rounded-lg border border-[#1d2c4f] divide-y divide-[#1d2c4f]">
                  {Object.entries(data.key_fields).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 px-3 py-1.5 text-sm">
                      <span className="text-[#aab5cf] capitalize">{k.replace(/_/g, " ")}</span>
                      <span className="text-right font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.extracted_text && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#aab5cf] mb-1">Full OCR text</p>
                <pre className="text-xs whitespace-pre-wrap bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg p-3 max-h-48 overflow-y-auto">{data.extracted_text}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ScanResultCard({ result, onDismiss }) {
  return (
    <div className="haven-card p-4 mb-4 border-[#d4af37]/40" data-testid="scan-result-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37] flex items-center gap-2">
            <Sparkles size={12} /> BB filed this for you
          </p>
          <p className="font-medium mt-1">{result.title || result.document?.filename}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <CategoryBadge type={result.classification} />
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {Math.round((result.confidence || 0) * 100)}% confident
            </span>
            {!result.is_legible && (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">Hard to read — consider rescanning</span>
            )}
          </div>
          {result.summary && <p className="text-sm text-[#aab5cf] mt-2">{result.summary}</p>}
        </div>
        <button data-testid="scan-result-dismiss" onClick={onDismiss} className="text-[#aab5cf] hover:text-white shrink-0"><X size={14} /></button>
      </div>
    </div>
  );
}

export default function ResidentDocumentsPage() {
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [docType, setDocType] = useState("identity");
  const [viewingDoc, setViewingDoc] = useState(null);
  const fileRef = useRef(null);
  const scanRef = useRef(null);

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

  async function refreshDocs() {
    const r = await api.get(`/documents?case_id=${activeCase.id}`);
    setDocs(r.data || []);
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !activeCase) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("case_id", activeCase.id);
      fd.append("type", docType);
      fd.append("file", file);
      await api.post("/documents", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`Uploaded ${file.name}`);
      await refreshDocs();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleScan(e) {
    const file = e.target.files?.[0];
    if (!file || !activeCase) return;
    setScanning(true);
    setScanResult(null);
    try {
      const fd = new FormData();
      fd.append("case_id", activeCase.id);
      fd.append("file", file);
      const r = await api.post("/documents/scan", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });
      setScanResult(r.data);
      toast.success(`Filed under ${CATEGORY_LABELS[r.data.classification] || r.data.classification}`);
      await refreshDocs();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Scan failed");
    } finally {
      setScanning(false);
      if (scanRef.current) scanRef.current.value = "";
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
              <div className="haven-card p-4 mb-4">
                <div className="flex flex-wrap items-end gap-3">
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
                  <button data-testid="doc-upload-btn" disabled={uploading || scanning} onClick={() => fileRef.current?.click()} className="haven-btn inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full btn-outline-navy disabled:opacity-50">
                    <Upload size={14} /> {uploading ? "Uploading…" : "Manual upload"}
                  </button>
                  <input ref={scanRef} type="file" hidden accept="image/jpeg,image/png,image/webp,application/pdf,.txt,.doc,.docx" onChange={handleScan} data-testid="doc-scan-input" />
                  <button data-testid="doc-scan-btn" disabled={scanning || uploading} onClick={() => scanRef.current?.click()} className="haven-btn inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full btn-gold disabled:opacity-50">
                    {scanning ? <Loader2 size={14} className="animate-spin" /> : <ScanLine size={14} />}
                    {scanning ? "BB is reading your document…" : "Smart Scan"}
                  </button>
                  <p className="text-[11px] text-[#aab5cf] ml-auto">8MB max. Encrypted at rest.</p>
                </div>
                <p className="text-[11px] text-[#aab5cf] mt-2 flex items-center gap-1.5">
                  <Sparkles size={11} className="text-[#d4af37]" /> Smart Scan reads your document (photo, PDF, Word, or text file), classifies it, and files it automatically. Extracted details are locked in the Apex Vault.
                </p>
              </div>

              {scanResult && <ScanResultCard result={scanResult} onDismiss={() => setScanResult(null)} />}

              <div className="grid gap-3">
                {docs.map((d) => (
                  <div key={d.id} className="haven-card p-3 flex items-center gap-3" data-testid={`doc-${d.id}`}>
                    <div className="w-10 h-10 rounded-lg bg-[#142244]/60 border border-[#1d2c4f] flex items-center justify-center shrink-0">
                      {d.scanned ? <ScanLine size={16} className="text-[#d4af37]" /> : <FileText size={16} className="text-[#aab5cf]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{d.filename}</p>
                        <CategoryBadge type={d.type} />
                        {d.scanned && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#f1d36b] border border-[#d4af37]/30 inline-flex items-center gap-1"><Sparkles size={10} /> BB scanned</span>
                        )}
                        {d.verified ? (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1"><ShieldCheck size={10} /> Verified</span>
                        ) : (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1"><AlertTriangle size={10} /> Pending review</span>
                        )}
                      </div>
                      {d.extracted_summary && <p className="text-[12px] text-[#aab5cf] mt-0.5 line-clamp-2">{d.extracted_summary}</p>}
                      <p className="text-[11px] text-[#aab5cf] mt-0.5">{(d.size / 1024).toFixed(0)} KB · {new Date(d.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {d.data_url && (
                        <a data-testid={`doc-view-${d.id}`} href={d.data_url} target="_blank" rel="noreferrer" className="haven-btn text-xs px-3 py-1 rounded-full btn-outline-navy text-center">View</a>
                      )}
                      {d.scanned && (
                        <button data-testid={`doc-extracted-${d.id}`} onClick={() => setViewingDoc(d)} className="haven-btn text-xs px-3 py-1 rounded-full btn-gold inline-flex items-center gap-1 justify-center"><KeyRound size={11} /> Vault</button>
                      )}
                    </div>
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
      {viewingDoc && <ExtractedDataModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
    </AppLayout>
  );
}
