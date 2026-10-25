import React from 'react';
import { CPUFlags } from '../cpu/types';
import { toHex8, toBin8, toSigned8 } from '../cpu/alu';
import { Cpu, Flag } from 'lucide-react';

interface RegisterPanelProps {
  regA: number;
  regB: number;
  pc: number;
  ir: string | null;
  flags: CPUFlags;
}

export const RegisterPanel: React.FC<RegisterPanelProps> = ({
  regA,
  regB,
  pc,
  ir,
  flags,
}) => {
  const renderRegisterCard = (
    name: string,
    val: number,
    description: string,
    isPrimary: boolean = false
  ) => {
    return (
      <div
        className={`p-3 rounded-xl border transition-all ${
          isPrimary
            ? 'bg-slate-900 border-cyan-500/40 shadow-sm shadow-cyan-950/20'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                isPrimary
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {name}
            </span>
            <span className="text-[11px] text-slate-400">{description}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">8-bit</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Hex</div>
            <div className="text-xs font-bold font-mono text-cyan-300">{toHex8(val)}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Dec (Unsigned)</div>
            <div className="text-xs font-bold font-mono text-slate-200">
              {val} <span className="text-[10px] text-slate-500 font-normal">({toSigned8(val)})</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Binary</div>
            <div className="text-[11px] font-bold font-mono text-emerald-400">{toBin8(val)}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderFlag = (label: string, name: string, active: boolean, desc: string) => {
    return (
      <div
        className={`p-2 rounded-lg border text-center transition-all ${
          active
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-950/30'
            : 'bg-slate-950/60 border-slate-800 text-slate-600'
        }`}
        title={`${name}: ${desc}`}
      >
        <div className="text-xs font-bold font-mono">{label}</div>
        <div className="text-[10px] mt-0.5 font-medium uppercase tracking-wider">{name}</div>
        <div
          className={`text-xs font-mono font-bold mt-1 ${
            active ? 'text-amber-400' : 'text-slate-600'
          }`}
        >
          {active ? '1 (SET)' : '0'}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Registers & Status Flags
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500">COA Lab Model</span>
      </div>

      {/* Program Counter & Instruction Register */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* PC */}
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              PC
            </span>
            <span className="text-[11px] text-slate-400">Program Counter</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xs font-mono text-slate-400">Address:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400 font-bold">{toHex8(pc)}</span>
              <span className="text-sm font-bold font-mono text-slate-100">[{pc}]</span>
            </div>
          </div>
        </div>

        {/* IR */}
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
              IR
            </span>
            <span className="text-[11px] text-slate-400">Instruction Register</span>
          </div>
          <div className="pt-1 overflow-hidden">
            <span className="text-xs font-mono font-bold text-violet-300 truncate block">
              {ir || 'NOP / None'}
            </span>
          </div>
        </div>
      </div>

      {/* Register A and Register B */}
      <div className="space-y-3">
        {renderRegisterCard('REG A', regA, 'Accumulator Register', true)}
        {renderRegisterCard('REG B', regB, 'General-Purpose Register', false)}
      </div>

      {/* Status Flags (Z, C, S, V) */}
      <div className="pt-1">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-mono text-slate-400">
          <Flag className="w-3.5 h-3.5 text-amber-400" />
          <span>Status Register Flags:</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {renderFlag('Z', 'Zero', flags.Z, 'Result equals zero')}
          {renderFlag('C', 'Carry', flags.C, 'Unsigned overflow / borrow')}
          {renderFlag('S', 'Sign', flags.S, 'MSB is 1 (negative signed value)')}
          {renderFlag('V', 'Overflow', flags.V, 'Signed arithmetic overflow')}
        </div>
      </div>
    </div>
  );
};
