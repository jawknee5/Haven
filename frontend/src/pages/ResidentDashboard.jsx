import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import BBChat from "@/components/BBChat";
import ResourceMapWidget from "@/components/ResourceMapWidget";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { MessageSquare, ListChecks, MapPin, CalendarClock, ArrowRight, LifeBuoy } from "lucide-react";

function StepCard({ n, title, body, href }) {
  return (
    <Link
      to={href}
      data-testid={`step-${n}`}
      className="haven-card p-5 hover:border-blue-500/40 transition haven-btn block"
    >
      <p className="font-mono text-xs text-blue-300/80">{n}</p>
      <h3 className="font-display font-medium mt-1">{title}</h3>
      <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{body}</p>
      <p className="text-xs text-blue-300 mt-3 inline-flex items-center gap-1">
        Continue <ArrowRight size={11} />
      </p>
    </Link>
  );
}

export default function ResidentDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);

  useEffect(() => {
    api.get("/cases").then((r) => setCases(r.data || [])).catch(() => {});
  }, []);

  const activeCase = cases[0];

  return (
    <AppLayout
      title={`Welcome, ${user?.name?.split(" ")[0] || "there"}.`}
      subtitle="You're in the right place. Take a breath — we'll go step by step."
      actions={
        <Link
          to="/crisis"
          data-testid="crisis-btn"
          className="haven-btn inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
        >
          <LifeBuoy size={14} /> I need help now
        </Link>
      }
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-7 space-y-6">
          <section>
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-blue-400">Your roadmap</p>
            <h2 className="font-display text-2xl font-semibold mt-1">Where you are right now</h2>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <StepCard n="01" title="Tell us what's happening" body="Answer a few simple questions about your situation." href="#" />
              <StepCard n="02" title="Get matched" body="We connect you to the right programs and people." href="/resources" />
              <StepCard n="03" title="Track your progress" body="Documents, messages, and next steps in one place." href="#" />
            </div>
          </section>

          {activeCase && (
            <section className="haven-card p-5">
              <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-blue-400">Your current case</p>
              <h3 className="font-display text-lg font-semibold mt-1">{activeCase.title}</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{activeCase.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <span className={`status-${activeCase.status} px-2 py-0.5 rounded-full uppercase tracking-wider text-[10px]`}>
                  {activeCase.status}
                </span>
                <span className="text-zinc-500">
                  Caseworker: <span className="text-zinc-200">{activeCase.caseworker_name || "Not yet assigned"}</span>
                </span>
              </div>
            </section>
          )}

          <section className="grid sm:grid-cols-3 gap-4">
            <Link to="/resources" className="haven-card p-4 hover:border-blue-500/40 transition block haven-btn" data-testid="r-card-resources">
              <MapPin size={16} className="text-blue-300" />
              <p className="font-medium mt-3 text-sm">Find resources</p>
              <p className="text-xs text-zinc-500 mt-1">Shelter, food, health, legal, crisis — near you.</p>
            </Link>
            <Link to="/book" className="haven-card p-4 hover:border-blue-500/40 transition block haven-btn" data-testid="r-card-book">
              <CalendarClock size={16} className="text-blue-300" />
              <p className="font-medium mt-3 text-sm">Book a session</p>
              <p className="text-xs text-zinc-500 mt-1">Talk to a caseworker on a schedule that works for you.</p>
            </Link>
            <Link to="#" className="haven-card p-4 hover:border-blue-500/40 transition block haven-btn" data-testid="r-card-messages">
              <MessageSquare size={16} className="text-blue-300" />
              <p className="font-medium mt-3 text-sm">Messages</p>
              <p className="text-xs text-zinc-500 mt-1">Secure conversation with your caseworker.</p>
            </Link>
          </section>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <ResourceMapWidget height={300} />
          <BBChat sessionId={`bb-res-${user?.id}`} contextLabel="Resident" compact />
        </div>
      </div>
    </AppLayout>
  );
}
