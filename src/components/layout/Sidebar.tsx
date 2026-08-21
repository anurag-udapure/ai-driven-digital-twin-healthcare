import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  UserCheck, 
  BrainCircuit, 
  BellRing, 
  History, 
  SlidersHorizontal,
  FileCode2,
  Database
} from 'lucide-react';

export type NavigationPage = 
  | 'dashboard' 
  | 'live_monitoring' 
  | 'digital_twin' 
  | 'risk_prediction' 
  | 'alerts' 
  | 'patient_history' 
  | 'simulation_center';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  activeAlertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  activeAlertCount = 0
}) => {
  const navItems: Array<{
    id: NavigationPage;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'live_monitoring',
      label: 'Live Monitoring',
      icon: <Activity className="w-4 h-4" />
    },
    {
      id: 'digital_twin',
      label: 'Digital Twin',
      icon: <UserCheck className="w-4 h-4" />
    },
    {
      id: 'risk_prediction',
      label: 'Risk Prediction',
      icon: <BrainCircuit className="w-4 h-4" />
    },
    {
      id: 'alerts',
      label: 'Alerts & Events',
      icon: <BellRing className="w-4 h-4" />,
      badge: activeAlertCount > 0 ? activeAlertCount : undefined
    },
    {
      id: 'patient_history',
      label: 'Patient History',
      icon: <History className="w-4 h-4" />
    },
    {
      id: 'simulation_center',
      label: 'Simulation Center',
      icon: <SlidersHorizontal className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-64 bg-[#071322] border-r border-[#0e2138] flex flex-col justify-between shrink-0 select-none shadow-xl">
      {/* Upper Navigation List */}
      <div className="p-3">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-sky-300/80 flex items-center justify-between">
          <span>Digital Twin</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400/80" />
        </div>
        <nav className="space-y-1 mt-1">
          {navItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm border border-blue-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-[#0e233d] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-sky-300/70'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-blue-700' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Technical Spec Box */}
      <div className="p-3 m-3 bg-[#0b1b2f] rounded-lg border border-[#132d4e] text-[11px] text-slate-300 space-y-2">
        <div className="flex items-center gap-1.5 text-sky-200 font-semibold">
          <Database className="w-3.5 h-3.5 text-sky-400" />
          <span>MIMIC-IV v2.2 Dataset</span>
        </div>
        <p className="text-[10px] text-slate-300/80 leading-tight">
          Clinical Demo subset containing Chartevents, Labevents, ICD Diagnoses & Prescriptions.
        </p>
        <div className="pt-2 border-t border-[#132d4e] flex items-center justify-between text-[10px]">
          <span className="text-slate-400">DL Model:</span>
          <span className="font-mono text-sky-200 bg-[#061221] px-2 py-0.5 rounded border border-sky-500/30 font-bold">
            CNN-BiLSTM
          </span>
        </div>
      </div>
    </aside>
  );
};
