import React from 'react';
import { CPUStatus } from '../cpu/types';
import { Cpu, RotateCcw } from 'lucide-react';

interface HeaderProps {
  status: CPUStatus;
  onReset: () => void;
  stepCount: number;
}

export const Header: React.FC<HeaderProps> = ({ status, onReset, stepCount }) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-100 border border-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse"></span>
            RUNNING
          </span>
        );
      case 'PAUSED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-850 text-slate-300 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            PAUSED
          </span>
        );
      case 'HALTED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            HALTED
          </span>
        );
      case 'ERROR':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-red-950/40 text-red-300 border border-red-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            ERROR
          </span>
        );
      case 'READY':
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            READY
          </span>
        );
    }
  };

  return (
    <header className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-3 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-wide text-slate-100 font-mono">
              8-BIT CPU SIMULATOR
            </h1>
            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
              COA Lab
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Computer Organization and Architecture Laboratory
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2 sm:mt-0">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
          <span>CYCLES:</span>
          <span className="text-slate-200 font-semibold">{stepCount}</span>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          title="Hardware Reset"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          Reset
        </button>
      </div>
    </header>
  );
};
