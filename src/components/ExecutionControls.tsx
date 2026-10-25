import React from 'react';
import { Play, Pause, StepForward, RotateCcw, CheckCircle2, ChevronDown } from 'lucide-react';
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
    <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
      <div className="flex flex-wrap items-center gap-2">
        {/* Assemble / Validate */}
        <button
          onClick={onAssemble}
          disabled={isRunning}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
            hasErrors
              ? 'bg-red-950/40 text-red-300 border-red-800/60 hover:bg-red-900/40'
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750 hover:text-white'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          title="Assemble and validate the program code into instruction memory"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
          Assemble & Validate
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Step */}
        <button
          onClick={onStep}
          disabled={isRunning || isHalted}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Execute single instruction step"
        >
          <StepForward className="w-3.5 h-3.5 text-slate-300" />
          Step
        </button>

        {/* Run / Pause */}
        {isRunning ? (
          <button
            onClick={onPause}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors cursor-pointer"
            title="Pause execution"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause
          </button>
        ) : (
          <button
            onClick={onRun}
            disabled={isHalted || hasErrors}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-medium bg-slate-200 hover:bg-white text-slate-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Run continuous execution"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run
          </button>
        )}

        {/* Reset */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          title="Reset registers and PC"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          Reset
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Speed slider */}
        <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400">Delay:</span>
          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            value={runSpeed}
            onChange={(e) => onSetRunSpeed(Number(e.target.value))}
            className="w-20 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-slate-400"
          />
          <span className="text-[11px] font-mono text-slate-300 w-12 text-right">
            {runSpeed}ms
          </span>
        </div>

        {/* Load Example Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            Load Example
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-750 rounded-lg shadow-xl py-1 z-40 max-h-96 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 font-mono">
                Academic Programs
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
                    <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
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
