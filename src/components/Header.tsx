import React from 'react';
import { CPUStatus } from '../cpu/types';
import { Cpu, RotateCcw, Activity } from 'lucide-react';

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
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            RUNNING
          </span>
        );
      case 'PAUSED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            PAUSED
          </span>
        );
      case 'HALTED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            HALTED
          </span>
        );
      case 'ERROR':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            ERROR
          </span>
        );
      case 'READY':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            READY
          </span>
        );
    }
  };

  return (
    <header className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-3.5 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Cpu className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold tracking-wider text-slate-100 font-mono">
              8-BIT CPU SIMULATOR
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
              v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 tracking-wide">
            Computer Organization and Architecture Laboratory
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-2 sm:mt-0">
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cyan-500" />
          <span>CYCLES:</span>
          <span className="text-cyan-300 font-bold">{stepCount}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">Status:</span>
          {getStatusBadge()}
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm cursor-pointer"
          title="Hardware Reset (Clears registers, PC and resets state)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset CPU
        </button>
      </div>
    </header>
  );
};
