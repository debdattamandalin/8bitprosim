import React from 'react';
import { Play, Pause, StepForward, RotateCcw, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';
import { CPUStatus } from '../cpu/types';
import { EXAMPLE_PROGRAMS, ExampleProgram } from '../cpu/examples';

interface ExecutionControlsProps {
  status: CPUStatus;
  runSpeed: number;
  onSetRunSpeed: (ms: number) => void;
  onAssemble: () => void;
  onStep: () => void;
  onRun: () => void;
  onPause: () => void;
  onReset: () => void;
  onLoadExample: (example: ExampleProgram) => void;
  hasErrors: boolean;
}

export const ExecutionControls: React.FC<ExecutionControlsProps> = ({
  status,
  runSpeed,
  onSetRunSpeed,
  onAssemble,
  onStep,
  onRun,
  onPause,
  onReset,
  onLoadExample,
  hasErrors,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const isRunning = status === 'RUNNING';
  const isHalted = status === 'HALTED' || status === 'ERROR';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
      <div className="flex flex-wrap items-center gap-2">
        {/* Assemble / Validate */}
        <button
          onClick={onAssemble}
          disabled={isRunning}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            hasErrors
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          title="Assemble and validate the program code into instruction memory"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Assemble & Validate
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Step */}
        <button
          onClick={onStep}
          disabled={isRunning || isHalted}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Execute exactly one instruction cycle (Fetch, Decode, Execute)"
        >
          <StepForward className="w-3.5 h-3.5 text-cyan-400" />
          Step
        </button>

        {/* Run / Pause */}
        {isRunning ? (
          <button
            onClick={onPause}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors cursor-pointer"
            title="Pause execution without altering registers or memory"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause
          </button>
        ) : (
          <button
            onClick={onRun}
            disabled={isHalted || hasErrors}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-900/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Run continuously until HALT, error, or execution limit"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run
          </button>
        )}

        {/* Reset */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          title="Reset registers, flags, and Program Counter to 0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          Reset
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Speed slider */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400">Delay:</span>
          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            value={runSpeed}
            onChange={(e) => onSetRunSpeed(Number(e.target.value))}
            className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            title={`${runSpeed}ms per instruction step`}
          />
          <span className="text-[11px] font-mono text-cyan-300 w-12 text-right">
            {runSpeed}ms
          </span>
        </div>

        {/* Load Example Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Load Example
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-40 max-h-96 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 font-mono">
                Academic Standard Programs
              </div>
              {EXAMPLE_PROGRAMS.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    onLoadExample(ex);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 transition-colors cursor-pointer border-b border-slate-800/40 last:border-none"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200">{ex.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {ex.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{ex.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
