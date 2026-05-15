import React from 'react';
import { 
  ShieldAlert, Activity, CheckCircle, MapPin, 
  Briefcase, FileText, BrainCircuit, ArrowRight 
} from 'lucide-react';

export default function Dashboard() {
  // Mock data for demonstration
  const user = { name: 'Pathway User' };
  const profile = { 
    onboardingCompleted: true,
    currentCity: 'San Jose Matrix'
  };
  
  const risk = {
    riskLevel: 'medium',
    recommendations: [
      'Check local housing resources in your district',
      'Review available employment sectors matching your profile',
      'Contact community health services for wellness assessment'
    ]
  };

  const tasks = [
    { id: 1, title: 'Complete Profile Setup', description: 'Fill in your demographic information', status: 'active', priority: 0 },
    { id: 2, title: 'Schedule Housing Consultation', description: 'Meet with a housing counselor', status: 'active', priority: 1 },
    { id: 3, title: 'Review Job Opportunities', description: 'Browse available employment options', status: 'active', priority: 2 },
  ];

  const alerts = [
    { id: 1, message: 'Severe weather advisory active. Shelter availability has increased.' }
  ];

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleConsultBB = () => {
    console.log('Consulting BB Engine...');
  };

  const handleNavigate = (path: string) => {
    console.log(`Navigating to ${path}`);
  };

  const handleTransparency = (section: string) => {
    console.log(`Opening transparency for ${section}`);
  };

  return (
    <div className="space-y-6 animate-fade-in bg-slate-950 min-h-screen text-slate-200 p-6">
      
      {/* Header Section */}
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-black tracking-tight text-white">
          Welcome back, <span className="text-blue-500">{user?.name?.split(' ')[0] ?? 'Citizen'}</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1 flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-slate-500" />
          {profile?.currentCity ?? 'San Jose Matrix'} | Pathway Genesis Active
        </p>
      </header>

      {/* Active Alerts (Crisis Routing) */}
      {alerts && alerts.length > 0 && (
        <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-4 shadow-lg shadow-red-900/20">
          <h3 className="text-red-400 font-bold text-sm mb-3 flex items-center tracking-wide uppercase">
            <ShieldAlert className="h-5 w-5 mr-2" /> Active Emergency Alerts
          </h3>
          <div className="space-y-2">
            {alerts.map((a) => (
              <p key={a.id} className="text-red-200 text-sm bg-red-900/20 p-2 rounded border border-red-800/30">
                {a.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OTEE Assessment Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-600 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="h-16 w-16 text-slate-400" />
          </div>
          <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">OTEE Urgency Assessment</p>
          <p className={`text-3xl font-black mt-2 capitalize tracking-tight ${
              risk?.riskLevel === 'critical' ? "text-red-500" : 
              risk?.riskLevel === 'high' ? "text-orange-500" : 
              risk?.riskLevel === 'medium' ? "text-yellow-500" : "text-emerald-500"
            }`}>
            {risk?.riskLevel ?? 'Pending'}
          </p>
          <button
            onClick={() => handleTransparency('firstResponse')}
            className="text-blue-500 text-xs mt-4 font-semibold hover:text-blue-400 flex items-center transition-colors"
          >
            View Engine Assessment <ArrowRight className="h-3 w-3 ml-1" />
          </button>
        </div>

        {/* Pathway Progress Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex items-center gap-6 hover:border-slate-600 transition-colors">
          <svg width="80" height="80" viewBox="0 0 64 64" className="flex-shrink-0 drop-shadow-lg">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#1e293b" strokeWidth="6" />
            <circle
              cx="32" cy="32" r="28" fill="none" stroke="#3b82f6" strokeWidth="6"
              strokeDasharray={`${progressPct * 1.76} 176`}
              strokeLinecap="round"
              transform="rotate(-90 32 32)"
              className="transition-all duration-1000 ease-out"
            />
            <text x="32" y="37" textAnchor="middle" className="fill-white text-sm font-black tracking-tighter">
              {progressPct}%
            </text>
          </svg>
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">Pathway Completion</p>
            <p className="text-2xl font-bold text-white mt-1">{completedTasks} / {totalTasks}</p>
            <p className="text-slate-400 text-sm mt-1">Directives fulfilled</p>
          </div>
        </div>
      </div>

      {/* HTCRM Actions & Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={handleConsultBB}
          className="md:col-span-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl p-4 shadow-lg shadow-blue-900/20 transition-all flex flex-col items-center justify-center border border-blue-400"
        >
          <BrainCircuit className="h-8 w-8 mb-2" />
          <span className="text-sm font-bold tracking-wide">Consult BB Engine</span>
        </button>

        {[
          { icon: <MapPin className="h-6 w-6" />, label: 'Resource Matrix', path: '/resources' },
          { icon: <Briefcase className="h-6 w-6" />, label: 'Employment Sectors', path: '/jobs' },
          { icon: <FileText className="h-6 w-6" />, label: 'Benefit Manifest', path: '/roadmap' },
        ].map((btn) => (
          <button
            key={btn.path}
            onClick={() => handleNavigate(btn.path)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-slate-800 hover:border-slate-600 transition-all shadow-md group"
          >
            <div className="text-blue-500 mb-2 group-hover:scale-110 transition-transform">{btn.icon}</div>
            <p className="text-sm font-semibold text-slate-300">{btn.label}</p>
          </button>
        ))}
      </div>

      {/* Daily Directives */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Active Directives</h2>
        <div className="space-y-3">
          {tasks?.filter((t) => t.status !== 'completed').slice(0, 5).map((task) => (
            <div key={task.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex items-start gap-4 hover:border-slate-600 transition-colors">
              <CheckCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                task.priority === 0 ? "text-red-500" : task.priority <= 2 ? "text-orange-500" : "text-yellow-500"
              }`} />
              <div>
                <p className="font-bold text-slate-200 text-sm">{task.title}</p>
                {task.description && (
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{task.description}</p>
                )}
              </div>
            </div>
          )) ?? (
            <p className="text-slate-500 text-sm italic">No active directives. Matrix is clear.</p>
          )}
        </div>
      </div>

      {/* HTCRM Recommendations */}
      {risk?.recommendations && risk.recommendations.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h3 className="font-bold text-sm mb-4 text-emerald-400 flex items-center uppercase tracking-wider">
            <Activity className="h-4 w-4 mr-2" /> HTCRM Routing Suggestions
          </h3>
          <ul className="space-y-3">
            {risk.recommendations.map((r, i) => (
              <li key={i} className="text-slate-300 text-sm flex items-start bg-slate-950 p-3 rounded-lg border border-slate-800">
                <ArrowRight className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" /> 
                {r}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleTransparency('mvpCoordinator')}
            className="text-slate-500 text-xs mt-4 hover:text-white transition-colors font-semibold"
          >
            Review Orchestration Telemetry
          </button>
        </div>
      )}
    </div>
  );
}
