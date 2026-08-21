import React from 'react';
import { Database, Cpu, Activity, Brain, UserCheck, AlertTriangle, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

interface PipelineFlowProps {
  id?: string;
  activeStage?: number;
}

export const PipelineFlow: React.FC<PipelineFlowProps> = ({ id = 'architecture-pipeline', activeStage = 3 }) => {
  const stages = [
    {
      id: 1,
      title: 'MIMIC-IV Data',
      subtitle: 'Hospital & ICU records (v2.2)',
      icon: <Database className="w-4 h-4 text-blue-600" />,
      status: 'Active',
      isReady: true
    },
    {
      id: 2,
      title: 'Preprocessing',
      subtitle: 'Imputation & Normalization',
      icon: <Cpu className="w-4 h-4 text-slate-700" />,
      status: 'Active',
      isReady: true
    },
    {
      id: 3,
      title: 'Real-Time Simulation',
      subtitle: 'Sequential Stream Replay',
      icon: <Activity className="w-4 h-4 text-emerald-600" />,
      status: 'Active',
      isReady: true
    },
    {
      id: 4,
      title: 'CNN-BiLSTM',
      subtitle: 'Deep Learning Model',
      icon: <Brain className="w-4 h-4 text-indigo-600" />,
      status: 'Integration Pending',
      isReady: false
    },
    {
      id: 5,
      title: 'Digital Twin',
      subtitle: 'Physiological State Vector',
      icon: <UserCheck className="w-4 h-4 text-sky-600" />,
      status: 'Active',
      isReady: true
    },
    {
      id: 6,
      title: 'Alerts',
      subtitle: 'Monitoring & Risk Alerts',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      status: 'Active',
      isReady: true
    }
  ];

  return (
    <div id={id} className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Project Architecture Pipeline</span>
          <span className="text-[11px] text-slate-400 font-medium">• Deep Learning & Simulation Dataflow</span>
        </div>
        <span className="text-[11px] font-mono font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
          MIMIC-IV DL System Flow
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5 relative">
        {stages.map((stage, idx) => {
          const isHighlight = stage.id === activeStage;
          return (
            <div key={stage.id} className="relative flex flex-col">
              <div
                className={`p-3 rounded-lg border flex flex-col justify-between h-full transition-all ${
                  isHighlight
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500/30 shadow-xs'
                    : !stage.isReady
                    ? 'border-dashed border-amber-300 bg-amber-50/40'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="p-1 rounded-md bg-white border border-slate-200 shadow-2xs">
                      {stage.icon}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">0{stage.id}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">{stage.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{stage.subtitle}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      stage.isReady ? 'text-emerald-700' : 'text-amber-800'
                    }`}
                  >
                    {stage.isReady ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Clock className="w-3 h-3 text-amber-600" />
                    )}
                    {stage.status}
                  </span>
                </div>
              </div>

              {idx < stages.length - 1 && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
