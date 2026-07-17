import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Video, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

const BOOKING_PURPOSES = [
  { value: "product-demo", label: "Product Demo" },
  { value: "speak-caseworker", label: "Speak to Caseworker" },
  { value: "intake", label: "Intake Session" },
  { value: "training", label: "Training" },
  { value: "integration", label: "Integration Discussion" },
];

const USER_ROLES = [
  { value: "resident", label: "Resident" },
  { value: "caseworker", label: "Caseworker" },
  { value: "admin", label: "Admin" },
  { value: "agency-partner", label: "Agency Partner" },
];

export default function BookPage() {
  const { user } = useAuth();
  const [role, setRole] = useState(user?.role || "resident");
  const [purpose, setPurpose] = useState("product-demo");
  const [selectedCaseworker, setSelectedCaseworker] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [caseworkers, setCaseworkers] = useState([]);
  const [agencies, setAgencies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const agenciesRes = await api.post("/booking.getAgencies");
        setAgencies(agenciesRes.data.result || []);

        const cwRes = await api.post("/booking.getCaseworkers");
        setCaseworkers(cwRes.data.result || []);
      } catch (err) {
        console.error("Failed to fetch booking data:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCaseworkers = async () => {
      try {
        if (!selectedAgency) {
          const cwRes = await api.post("/booking.getCaseworkers");
          setCaseworkers(cwRes.data.result || []);
        } else {
          const cwRes = await api.post("/booking.getCaseworkers", { agency: selectedAgency });
          setCaseworkers(cwRes.data.result || []);
        }
      } catch (err) {
        console.error("Failed to fetch caseworkers:", err);
      }
    };

    fetchCaseworkers();
  }, [selectedAgency]);

  const assignedCaseworker = selectedCaseworker
    ? caseworkers.find((cw) => cw.id === selectedCaseworker)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSubmitted(true);

    try {
      const response = await api.post("/booking.create", {
        userEmail: user?.email || "guest@haven.demo",
        userName: user?.name,
        userRole: role,
        bookingPurpose: purpose,
        selectedAgency: selectedAgency || undefined,
        caseworkerId: selectedCaseworker || undefined,
        caseworkerName: assignedCaseworker?.name || undefined,
      });

      const joinUrl = response?.data?.result?.joinUrl;
      if (!joinUrl) {
        throw new Error("Missing Zoom URL");
      }

      setTimeout(() => {
        window.open(joinUrl, "_blank");
      }, 800);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create booking. Please try again.");
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-[var(--haven-text)]">
      <header className="px-6 py-5 flex items-center justify-between border-b border-[var(--haven-border)] bg-[#070f1d]/90">
        <Link to="/home" className="flex items-center gap-2 text-[#aab5cf] hover:text-[#f1d36b] text-sm">
          <ArrowLeft size={14} /> Home
        </Link>
        <Link to="/home" className="flex items-center gap-2">
          <img src="/haven-bird.png" alt="HAVEN" className="h-8 w-auto" />
          <span className="font-serif-haven font-semibold tracking-[0.18em] text-gold">HAVEN</span>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37]">Book a session</p>
        <h1 className="font-serif-haven text-4xl font-semibold tracking-tight mt-3">Schedule a Zoom call.</h1>
        <p className="text-[#aab5cf] mt-3 max-w-2xl leading-relaxed">
          Connect with our team via Zoom. Choose your role, the purpose of your meeting, and if applicable, select a specific caseworker.
        </p>

        <div className="mt-10 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex gap-2">
                  <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-300">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#cfd8e8] mb-3">What is your role?</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {USER_ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`haven-card px-4 py-3 text-sm font-medium transition border ${
                        role === r.value
                          ? "bg-[#d4af37]/15 border-[#d4af37]/40 text-[#f1d36b]"
                          : "border-[#1d2c4f] text-[#aab5cf] hover:bg-[#142244]/50"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#cfd8e8] mb-3">What is the purpose of your booking?</label>
                <select
                  value={purpose}
                  onChange={(e) => {
                    setPurpose(e.target.value);
                    setSelectedCaseworker("");
                  }}
                  className="w-full haven-card px-4 py-2.5 text-sm border border-[#1d2c4f] rounded-lg bg-[#0a142b]/70 text-[#cfd8e8] focus:outline-none focus:border-[#d4af37]/60"
                >
                  {BOOKING_PURPOSES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {purpose === "speak-caseworker" && (
                <div>
                  <label className="block text-sm font-medium text-[#cfd8e8] mb-3">Select an agency</label>
                  <select
                    value={selectedAgency}
                    onChange={(e) => {
                      setSelectedAgency(e.target.value);
                      setSelectedCaseworker("");
                    }}
                    className="w-full haven-card px-4 py-2.5 text-sm border border-[#1d2c4f] rounded-lg bg-[#0a142b]/70 text-[#cfd8e8] focus:outline-none focus:border-[#d4af37]/60"
                  >
                    <option value="">-- Any Agency --</option>
                    {agencies.map((agency) => (
                      <option key={agency.code} value={agency.code}>
                        {agency.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {purpose === "speak-caseworker" && (
                <div>
                  <label className="block text-sm font-medium text-[#cfd8e8] mb-3">
                    Select a caseworker {!selectedCaseworker && "(optional)"}
                  </label>
                  <select
                    value={selectedCaseworker}
                    onChange={(e) => setSelectedCaseworker(e.target.value)}
                    className="w-full haven-card px-4 py-2.5 text-sm border border-[#1d2c4f] rounded-lg bg-[#0a142b]/70 text-[#cfd8e8] focus:outline-none focus:border-[#d4af37]/60"
                  >
                    <option value="">-- Default: Architect --</option>
                    {caseworkers.map((cw) => (
                      <option key={cw.id} value={cw.id}>
                        {cw.name} ({cw.agency})
                      </option>
                    ))}
                  </select>
                  {!selectedCaseworker && (
                    <p className="text-xs text-[#6d7a9a] mt-2">
                      If no caseworker is selected, you will be routed to a Zoom meeting with the Architect.
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || submitted}
                className="w-full haven-btn py-3 rounded-lg btn-gold haven-glow-gold flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin">
                      <Video size={16} />
                    </div>
                    Generating link...
                  </>
                ) : submitted ? (
                  <>
                    <CheckCircle size={16} /> Opening Zoom...
                  </>
                ) : (
                  <>
                    <Video size={16} /> Join Zoom Meeting
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="haven-card p-5 bg-[#06101e]">
              <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37] mb-2">Meeting Details</p>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[#6d7a9a]">Platform</p>
                  <p className="text-[#cfd8e8] font-medium">Zoom</p>
                </div>
                <div>
                  <p className="text-[#6d7a9a]">Your Role</p>
                  <p className="text-[#cfd8e8] font-medium capitalize">
                    {USER_ROLES.find((r) => r.value === role)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-[#6d7a9a]">Purpose</p>
                  <p className="text-[#cfd8e8] font-medium">
                    {BOOKING_PURPOSES.find((p) => p.value === purpose)?.label}
                  </p>
                </div>
                {assignedCaseworker && (
                  <div>
                    <p className="text-[#6d7a9a]">Caseworker</p>
                    <p className="text-[#cfd8e8] font-medium">{assignedCaseworker.name}</p>
                  </div>
                )}
                {!assignedCaseworker && purpose === "speak-caseworker" && (
                  <div>
                    <p className="text-[#6d7a9a]">Caseworker</p>
                    <p className="text-[#cfd8e8] font-medium">Architect (default)</p>
                  </div>
                )}
              </div>
            </div>

            <div className="haven-card p-5 border border-[#d4af37]/30 bg-[#d4af37]/5">
              <p className="text-xs text-[#d4af37] leading-relaxed">
                All meetings are conducted via Zoom. You will receive a join link immediately after submitting this form.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
