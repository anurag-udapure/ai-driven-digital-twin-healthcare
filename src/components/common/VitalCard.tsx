import React from 'react';
import { Activity, Heart, Wind, Thermometer, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface VitalCardProps {
  id: string;
  parameter: string;
  name: string;
  value: number | string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  source: 'MIMIC-IV Demo' | 'Simulated Real-Time Stream';
  minRange?: number | string;
  maxRange?: number | string;
  trend?: 'up' | 'down' | 'stable';
  subLabel?: string;
  sparklineData?: number[];
}

export const VitalCard: React.FC<VitalCardProps> = ({
  id,
  parameter,
  name,
  value,
  unit,
  status,
  source,
  minRange,
  maxRange,
  trend = 'stable',
  subLabel,
  sparklineData
}) => {
  const getIcon = () => {
    switch (parameter) {
      case 'heart_rate':
        return <Heart className="w-5 h-5 text-rose-600" />;
      case 'spo2':
        return <Activity className="w-5 h-5 text-sky-600" />;
      case 'bp':
      case 'blood_pressure':
        return <Activity className="w-5 h-5 text-indigo-600" />;
      case 'resp_rate':
        return <Wind className="w-5 h-5 text-teal-600" />;
      case 'temperature':
        return <Thermometer className="w-5 h-5 text-amber-600" />;
      default:
        return <Activity className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-rose-500" />;
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-sky-500" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  const isSimulated = source === 'Simulated Real-Time Stream';

  return (
    <div
      id={id}
      className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
    >
      <div>
        {/* Top bar: Name + Icon + Status */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-50/80 rounded-lg border border-slate-200/60 shadow-2xs">
              {getIcon()}
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">{name}</h4>
              {subLabel && <p className="text-[11px] text-slate-400 leading-tight">{subLabel}</p>}
            </div>
          </div>
          <StatusBadge id={`${id}-status-badge`} status={status} size="sm" />
        </div>

        {/* Value + Unit + Trend */}
        <div className="flex items-baseline justify-between mt-3 mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">{value}</span>
            <span className="text-xs font-semibold text-slate-500">{unit}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/80">
            {getTrendIcon()}
            <span className="capitalize font-medium">{trend}</span>
          </div>
        </div>

        {/* Mini sparkline visualization if data provided */}
        {sparklineData && sparklineData.length > 1 && (
          <div className="h-6 w-full my-2.5 flex items-end gap-1 bg-slate-50/50 p-1 rounded border border-slate-100">
            {(() => {
              const min = Math.min(...sparklineData);
              const max = Math.max(...sparklineData);
              const range = max - min || 1;
              return sparklineData.slice(-12).map((val, idx) => {
                const heightPercent = Math.max(15, Math.min(100, ((val - min) / range) * 100));
                return (
                  <div
                    key={idx}
                    className={`flex-1 rounded-xs transition-all ${
                      status === 'critical'
                        ? 'bg-rose-500'
                        : status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-sky-500'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                    title={`Value: ${val} ${unit}`}
                  />
                );
              });
            })()}
          </div>
        )}
      </div>

      {/* Card Footer: Range & Source Indicator */}
      <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span className="text-slate-500">
          {minRange !== undefined && maxRange !== undefined ? (
            <>Reference Range: <span className="font-mono text-slate-700 font-semibold">{minRange}–{maxRange} {unit}</span></>
          ) : (
            <span className="text-slate-400">Reference Range</span>
          )}
        </span>
        <span
          id={`${id}-source-badge`}
          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
            isSimulated
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-sky-50 text-sky-800 border-sky-200'
          }`}
          title={isSimulated ? 'Simulated dynamic observation' : 'MIMIC-IV Demo 2.2 dataset record'}
        >
          {source}
        </span>
      </div>
    </div>
  );
};
