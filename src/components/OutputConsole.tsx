import React from 'react';
import { CPUStateSnapshot, LogEntry } from '../cpu/types';
import { toHex8, toBin8 } from '../cpu/alu';
import { Monitor, TerminalSquare, Database, Cpu } from 'lucide-react';

interface OutputConsoleProps {
  snapshot: CPUStateSnapshot;
  logs: LogEntry[];
}

export const OutputConsole: React.FC<OutputConsoleProps> = ({ snapshot, logs }) => {
  // Collect all memory written locations
  const storedMemoryEntries = React.useMemo(() => {
    const map = new Map<number, number>();
    logs.forEach((l) => {
      if (l.memoryChange) {
        map.set(l.memoryChange.address, l.memoryChange.value);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [logs]);

  // Last log event description
  const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden font-mono text-xs">
      {/* Console Top Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <Monitor className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            SIMULATOR PROGRAM OUTPUT
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span
            className={`w-2 h-2 rounded-full ${
              snapshot.status === 'RUNNING'
                ? 'bg-emerald-400 animate-pulse'
                : snapshot.status === 'HALTED'
                ? 'bg-slate-300'
                : snapshot.status === 'ERROR'
                ? 'bg-red-400'
                : 'bg-slate-600'
            }`}
          />
          <span>{snapshot.status}</span>
        </div>
      </div>

      {/* Main Output Screen */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-950/80">
        {/* Execution Summary Box */}
        <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold border-b border-slate-800 pb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>PROCESSOR TERMINATION STATE</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <div>
              <span className="text-slate-500">Status: </span>
              <span
                className={`font-semibold ${
                  snapshot.status === 'HALTED'
                    ? 'text-slate-100'
                    : snapshot.status === 'ERROR'
                    ? 'text-red-300'
                    : 'text-slate-300'
                }`}
              >
                {snapshot.status}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Total Cycles: </span>
              <span className="text-slate-200 font-semibold">{snapshot.stepCount}</span>
            </div>
            <div>
              <span className="text-slate-500">Register A (ACC): </span>
              <span className="text-slate-100 font-bold">
                {snapshot.A} <span className="text-slate-500 font-normal">({toHex8(snapshot.A)})</span>
              </span>
            </div>
            <div>
              <span className="text-slate-500">Register B: </span>
              <span className="text-slate-100 font-bold">
                {snapshot.B} <span className="text-slate-500 font-normal">({toHex8(snapshot.B)})</span>
              </span>
            </div>
            <div>
              <span className="text-slate-500">Flags: </span>
              <span className="text-slate-300">
                Z={+snapshot.flags.Z} C={+snapshot.flags.C} S={+snapshot.flags.S} V={+snapshot.flags.V}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Last IR: </span>
              <span className="text-slate-300">{snapshot.IR || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Written Outputs / Memory Results */}
        <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
              <Database className="w-3.5 h-3.5" />
              <span>COMPUTED STORED OUTPUTS (RAM)</span>
            </div>
            <span className="text-[10px] text-slate-500">{storedMemoryEntries.length} writes</span>
          </div>

          {storedMemoryEntries.length === 0 ? (
            <div className="text-slate-600 text-center py-4 text-xs">
              No STORE instructions executed yet. Run a program to view results.
            </div>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {storedMemoryEntries.map(([addr, val]) => (
                <div
                  key={addr}
                  className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800 text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">Memory[{addr}]</span>
                    <span className="text-[10px] text-slate-500">({toHex8(addr)})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[10px]">{toBin8(val)}</span>
                    <span className="text-slate-400 text-[10px] font-mono">{toHex8(val)}</span>
                    <span className="text-slate-100 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      = {val}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Terminal Last Action Output */}
        <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
            <TerminalSquare className="w-3.5 h-3.5" />
            <span>LAST CYCLE ACTION</span>
          </div>
          <div className="text-[11px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-800/80">
            {lastLog ? (
              <div>
                <span className="text-slate-500">[PC:{toHex8(lastLog.pc)}] </span>
                <span className="text-slate-200 font-semibold">{lastLog.instructionStr} &rarr; </span>
                <span>{lastLog.details}</span>
              </div>
            ) : (
              <span className="text-slate-600">No cycles executed yet. Click Run or Step.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
