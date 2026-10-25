import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../cpu/types';
import { toHex8 } from '../cpu/alu';
import { Terminal, Trash2 } from 'lucide-react';

interface ExecutionLogProps {
  logs: LogEntry[];
  onClearLogs?: () => void;
}

export const ExecutionLog: React.FC<ExecutionLogProps> = ({ logs, onClearLogs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest log entry
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  const getStageBadge = (stage: LogEntry['stage']) => {
    switch (stage) {
      case 'EXECUTE':
        return <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">EXEC</span>;
      case 'FETCH':
        return <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">FETCH</span>;
      case 'HALT':
        return <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">HALT</span>;
      case 'ERROR':
        return <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">ERR</span>;
      default:
        return <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">{stage}</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Execution Log
          </span>
          <span className="text-[10px] text-slate-500 font-mono">({logs.length} events)</span>
        </div>

        {onClearLogs && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 font-mono transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 bg-slate-950/70"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 text-center py-6">
            Execution logs will appear here during runtime.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded-lg border text-[11px] leading-relaxed transition-all ${
                log.stage === 'ERROR'
                  ? 'bg-rose-950/40 border-rose-800/50 text-rose-200'
                  : log.stage === 'HALT'
                  ? 'bg-indigo-950/40 border-indigo-800/50 text-indigo-200'
                  : 'bg-slate-900/80 border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  {getStageBadge(log.stage)}
                  <span className="text-slate-500 font-mono">
                    #{log.stepNumber} [PC:{toHex8(log.pc)}]
                  </span>
                  <span className="font-semibold text-cyan-300">
                    {log.instructionStr}
                  </span>
                </div>
                <span className="text-[10px] text-slate-600">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="text-slate-300 pl-1">{log.details}</div>

              {/* State changes badges */}
              <div className="flex flex-wrap gap-2 mt-1.5 pt-1 border-t border-slate-800/60 text-[10px]">
                {log.regA !== undefined && (
                  <span className="text-slate-400">
                    A: <strong className="text-cyan-400">{log.regA}</strong>
                  </span>
                )}
                {log.regB !== undefined && (
                  <span className="text-slate-400">
                    B: <strong className="text-cyan-400">{log.regB}</strong>
                  </span>
                )}
                {log.memoryChange && (
                  <span className="text-emerald-400 bg-emerald-500/10 px-1 rounded border border-emerald-500/20">
                    Mem[{log.memoryChange.address}] &larr; {log.memoryChange.value}
                  </span>
                )}
                {log.flags && (
                  <span className="text-amber-400/90 ml-auto">
                    Flags: Z:{+log.flags.Z} C:{+log.flags.C} S:{+log.flags.S} V:{+log.flags.V}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
