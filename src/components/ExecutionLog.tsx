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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Execution Log
          </span>
          <span className="text-[10px] text-slate-500 font-mono">({logs.length})</span>
        </div>

        {onClearLogs && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 font-mono transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2.5 font-mono text-xs space-y-1 bg-slate-950/70"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 text-center py-6 text-xs">
            No execution events yet.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded border text-[11px] leading-relaxed transition-all ${
                log.stage === 'ERROR'
                  ? 'bg-red-950/30 border-red-900/50 text-red-200'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold">
                    {log.stage}
                  </span>
                  <span className="text-slate-500 font-mono">
                    #{log.stepNumber} [PC:{toHex8(log.pc)}]
                  </span>
                  <span className="font-semibold text-slate-200">
                    {log.instructionStr}
                  </span>
                </div>
                <span className="text-[10px] text-slate-600">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="text-slate-400 pl-0.5">{log.details}</div>

              <div className="flex flex-wrap gap-2 mt-1 pt-1 border-t border-slate-800/60 text-[10px]">
                {log.regA !== undefined && (
                  <span className="text-slate-500">
                    A: <strong className="text-slate-200">{log.regA}</strong>
                  </span>
                )}
                {log.regB !== undefined && (
                  <span className="text-slate-500">
                    B: <strong className="text-slate-200">{log.regB}</strong>
                  </span>
                )}
                {log.memoryChange && (
                  <span className="text-slate-300 bg-slate-800 px-1 rounded">
                    Mem[{log.memoryChange.address}] = {log.memoryChange.value}
                  </span>
                )}
                {log.flags && (
                  <span className="text-slate-400 ml-auto font-mono">
                    Z:{+log.flags.Z} C:{+log.flags.C} S:{+log.flags.S} V:{+log.flags.V}
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
