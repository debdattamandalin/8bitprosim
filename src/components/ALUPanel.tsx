import React from 'react';
import { ALUState } from '../cpu/types';
import { toHex8, toBin8 } from '../cpu/alu';
import { Binary, Check, X } from 'lucide-react';

interface ALUPanelProps {
  aluState: ALUState;
}

export const ALUPanel: React.FC<ALUPanelProps> = ({ aluState }) => {
  const isIdle = aluState.operation === null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Arithmetic Logic Unit (ALU)
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isIdle ? 'bg-slate-600' : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <span className="text-[10px] font-mono text-slate-400">
            {isIdle ? 'IDLE' : 'COMPUTING'}
          </span>
        </div>
      </div>

      {isIdle ? (
        <div className="p-5 rounded-lg bg-slate-950/60 border border-dashed border-slate-800 text-center">
          <p className="text-xs text-slate-500 font-mono">
            ALU is currently idle. No arithmetic or logical instruction being executed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Operation & Operands summary */}
          <div className="grid grid-cols-3 gap-2 text-center bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">Operation</div>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                {aluState.operation}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">Operands</div>
              <div className="text-xs font-bold font-mono text-slate-200 mt-0.5">
                {aluState.operand1 !== null ? aluState.operand1 : '-'}
                {aluState.operand2 !== null ? ` , ${aluState.operand2}` : ''}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">Result</div>
              <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">
                {aluState.result !== null ? aluState.result : '-'}
              </div>
            </div>
          </div>

          {/* Detailed Bitwise Representation */}
          {aluState.result !== null && (
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs space-y-1.5">
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Hexadecimal:</span>
                <span className="text-cyan-400 font-bold">{toHex8(aluState.result)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Binary:</span>
                <span className="text-emerald-400 font-bold">{toBin8(aluState.result)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
                <span>Calculated Flags:</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-[10px]">
                    Z:{' '}
                    {aluState.flags.Z ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <X className="w-3 h-3 text-slate-600" />
                    )}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px]">
                    C:{' '}
                    {aluState.flags.C ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <X className="w-3 h-3 text-slate-600" />
                    )}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px]">
                    S:{' '}
                    {aluState.flags.S ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <X className="w-3 h-3 text-slate-600" />
                    )}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px]">
                    V:{' '}
                    {aluState.flags.V ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <X className="w-3 h-3 text-slate-600" />
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
