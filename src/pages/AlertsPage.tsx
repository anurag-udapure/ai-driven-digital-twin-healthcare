import React, { useState } from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  SlidersHorizontal,
  FileText,
  User
} from 'lucide-react';
import { AlertEvent, Patient } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

interface AlertsPageProps {
  alerts: AlertEvent[];
  patients: Patient[];
  onAcknowledgeAlert: (alertId: string, notes?: string) => void;
  onResolveAlert: (alertId: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  patients,
  onAcknowledgeAlert,
  onResolveAlert
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedPatientFilter, setSelectedPatientFilter] = useState<string>('all');

  const filteredAlerts = alerts.filter(alert => {
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'all' && alert.status !== selectedStatus) return false;
    if (selectedSource !== 'all' && alert.source !== selectedSource) return false;
    if (selectedPatientFilter !== 'all' && alert.subject_id !== Number(selectedPatientFilter)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        alert.event.toLowerCase().includes(q) ||
        alert.parameter.toLowerCase().includes(q) ||
        alert.id.toLowerCase().includes(q) ||
        (alert.notes && alert.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const severityCounts = {
    critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
    warning: alerts.filter(a => a.severity === 'warning' && a.status === 'active').length,
    monitoring: alerts.filter(a => a.severity === 'monitoring' && a.status === 'active').length,
    information: alerts.filter(a => a.severity === 'information' && a.status === 'active').length
  };

  return (
    <div id="page-alerts" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Clinical Alerts & Events Center
            </h2>
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">
              {alerts.length} Total Events
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Continuous threshold alarms and clinical event logs from MIMIC-IV chartevents & live simulation stream
          </p>
        </div>

        {/* Quick Severity Badges */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold font-mono">
            {severityCounts.critical} Critical Active
          </span>
          <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold font-mono">
            {severityCounts.warning} Warnings
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search parameter, event..."
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="monitoring">Monitoring</option>
              <option value="information">Information</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={selectedSource}
              onChange={e => setSelectedSource(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Data Sources</option>
              <option value="MIMIC-IV Event">MIMIC-IV Event</option>
              <option value="Simulated Stream Threshold">Simulated Stream Threshold</option>
              <option value="Clinical Rule Engine">Clinical Rule Engine</option>
            </select>
          </div>

          {/* Patient Filter */}
          <div>
            <select
              value={selectedPatientFilter}
              onChange={e => setSelectedPatientFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Patients</option>
              {Array.from(new Set(patients.map(p => p.subject_id))).map(sid => (
                <option key={sid} value={sid}>
                  Patient #{sid}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#001f3f] border-b border-[#092b52] text-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Parameter & Event</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No alerts match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map(alert => (
                  <tr
                    key={alert.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      alert.status === 'active' && alert.severity === 'critical'
                        ? 'bg-rose-50/30'
                        : alert.status === 'active' && alert.severity === 'warning'
                        ? 'bg-amber-50/20'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap font-medium">
                      {alert.timestamp}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900">
                        #{alert.subject_id}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">{alert.parameter}</span>
                        <span className="text-slate-600 text-[11px] block font-medium">{alert.event}</span>
                        {alert.valueText && (
                          <span className="text-slate-500 font-mono text-[10px] block">{alert.valueText}</span>
                        )}
                        {alert.notes && (
                          <span className="text-slate-500 italic text-[10px] block mt-0.5">
                            Note: {alert.notes}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={alert.severity as any} size="sm" />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          alert.source === 'MIMIC-IV Event'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : alert.source === 'Simulated Stream Threshold'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {alert.source}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${
                          alert.status === 'active'
                            ? 'text-rose-700'
                            : alert.status === 'acknowledged'
                            ? 'text-amber-700'
                            : 'text-slate-500'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            alert.status === 'active'
                              ? 'bg-rose-500 animate-pulse'
                              : alert.status === 'acknowledged'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span className="capitalize">{alert.status}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {alert.status === 'active' ? (
                        <button
                          onClick={() => onAcknowledgeAlert(alert.id, 'Acknowledged by bedside clinical monitor')}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      ) : alert.status === 'acknowledged' ? (
                        <button
                          onClick={() => onResolveAlert(alert.id)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
