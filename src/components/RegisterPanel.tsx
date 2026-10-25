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
        className={`p-2.5 rounded-lg border transition-all ${
          isPrimary
            ? 'bg-slate-900 border-slate-700'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold font-mono px-1.5 py-0.5 rounded ${
                isPrimary
                  ? 'bg-slate-800 text-slate-200 border border-slate-650'
                  : 'bg-slate-850 text-slate-300 border border-slate-750'
              }`}
            >
              {name}
            </span>
            <span className="text-[11px] text-slate-400">{description}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">8-bit</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center bg-slate-950 p-2 rounded border border-slate-800/80">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Hex</div>
            <div className="text-xs font-semibold font-mono text-slate-200">{toHex8(val)}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Dec</div>
            <div className="text-xs font-semibold font-mono text-slate-200">
              {val} <span className="text-[10px] text-slate-500 font-normal">({toSigned8(val)})</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Binary</div>
            <div className="text-[11px] font-semibold font-mono text-slate-300">{toBin8(val)}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderFlag = (label: string, name: string, active: boolean, desc: string) => {
    return (
      <div
        className={`p-2 rounded border text-center transition-all ${
          active
            ? 'bg-slate-800 border-slate-600 text-slate-100'
            : 'bg-slate-950/60 border-slate-800/80 text-slate-600'
        }`}
        title={`${name}: ${desc}`}
      >
        <div className="text-xs font-semibold font-mono">{label}</div>
        <div className="text-[9px] mt-0.5 uppercase tracking-wide">{name}</div>
        <div
          className={`text-xs font-mono font-semibold mt-1 ${
            active ? 'text-slate-100' : 'text-slate-600'
          }`}
        >
          {active ? '1' : '0'}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Registers & Status Flags
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500">Architecture</span>
      </div>

      {/* PC & IR */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-2 rounded bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300">
              PC
            </span>
            <span className="text-[10px] text-slate-400">Program Counter</span>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-xs font-mono text-slate-400">Val:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-slate-300">{toHex8(pc)}</span>
              <span className="text-xs font-semibold font-mono text-slate-100">[{pc}]</span>
            </div>
          </div>
        </div>

        <div className="p-2 rounded bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300">
              IR
            </span>
            <span className="text-[10px] text-slate-400">Inst Register</span>
          </div>
          <div className="pt-0.5 overflow-hidden">
            <span className="text-xs font-mono text-slate-200 truncate block">
              {ir || 'NOP'}
            </span>
          </div>
        </div>
      </div>

      {/* Registers */}
      <div className="space-y-2.5">
        {renderRegisterCard('REG A', regA, 'Accumulator Register', true)}
        {renderRegisterCard('REG B', regB, 'General-Purpose Register', false)}
      </div>

      {/* Flags */}
      <div className="pt-0.5">
        <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-mono text-slate-400">
          <Flag className="w-3 h-3 text-slate-500" />
          <span>Flags:</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {renderFlag('Z', 'Zero', flags.Z, 'Result is zero')}
          {renderFlag('C', 'Carry', flags.C, 'Unsigned overflow/borrow')}
          {renderFlag('S', 'Sign', flags.S, 'Negative signed value')}
          {renderFlag('V', 'Overflow', flags.V, 'Signed arithmetic overflow')}
        </div>
      </div>
    </div>
  );
};
