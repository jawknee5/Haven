import React, { useState, useEffect } from 'react';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [stats, setStats] = useState({ new: 0, enriched: 0, routed: 0 });

  const login = async () => {
    const res = await fetch('http://localhost:4000/api/auth/login', { method: 'POST' });
    const data = await res.json();
    setToken(data.token);
  };

  const fetchCases = async () => {
    if (!token) return;
    const res = await fetch('http://localhost:4000/api/cases', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setCases(data);
    
    // Calculate Stats
    setStats({
      new: data.filter((c: any) => c.status === 'NEW').length,
      enriched: data.filter((c: any) => c.status === 'ENRICHED').length,
      routed: data.filter((c: any) => c.status === 'ROUTED').length,
    });
  };

  const enrichCase = async (id: string) => {
    await fetch(`http://localhost:4000/api/cases/${id}/enrich`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchCases(); // Refresh
  };

  useEffect(() => {
    if (token) fetchCases();
  }, [token]);

  if (!token) {
    return (
      <div className="flex h-screen bg-slate-900 justify-center items-center">
        <button onClick={login} className="bg-blue-600 text-white p-4 rounded font-bold shadow-lg hover:bg-blue-500 transition">
          Initiate JWT Handshake (Login)
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans">
      <div className="w-64 bg-slate-900 border-r border-slate-700 p-6">
        <h2 className="text-xl font-bold tracking-wider text-blue-500">HAVEN</h2>
        <p className="text-xs text-green-400 mt-2">● JWT Auth Active</p>
        <p className="text-xs text-slate-500 mt-4">UI by Gordon from Docker</p>
        <p className="text-xs text-slate-500">Engines by Johnathan R.</p>
      </div>
      
      <main className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8">Civic Operations Center</h1>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow"><h3 className="text-slate-400 text-sm">Pending</h3><p className="text-3xl font-bold text-yellow-500">{stats.new}</p></div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow"><h3 className="text-slate-400 text-sm">AI Enriched</h3><p className="text-3xl font-bold text-blue-400">{stats.enriched}</p></div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow"><h3 className="text-slate-400 text-sm">Routed</h3><p className="text-3xl font-bold text-green-400">{stats.routed}</p></div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-bold mb-4">Ingestion Feed</h2>
          {cases.map(c => (
            <div key={c.id} className="p-4 mb-4 bg-slate-900 border border-slate-600 rounded flex justify-between items-center">
              <div>
                <h4 className="font-bold">{c.title}</h4>
                <p className="text-sm text-slate-400">Status: {c.status} | Score: {c.urgencyScore || 'N/A'}</p>
              </div>
              {c.status === 'NEW' && (
                <button onClick={() => enrichCase(c.id)} className="bg-purple-600 px-4 py-2 rounded text-sm hover:bg-purple-500">Trigger AI Engine</button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
