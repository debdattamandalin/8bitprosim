import React from 'react';
import { ALUState } from '../cpu/types';
import { toHex8, toBin8 } from '../cpu/alu';
import { Binary } from 'lucide-react';

interface ALUPanelProps {
  aluState: ALUState;
}

export const ALUPanel: React.FC<ALUPanelProps> = ({ aluState }) => {
  const isIdle = aluState.operation === null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-2.5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <Binary className="w-3.5 h-3.5 text-slate-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Arithmetic Logic Unit (ALU)
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isIdle ? 'bg-slate-600' : 'bg-slate-300'
            }`}
          />
          <span className="text-[10px] font-mono text-slate-400">
            {isIdle ? 'IDLE' : 'COMPUTING'}
          </span>
        </div>
      </div>

      {isIdle ? (
        <div className="p-4 rounded bg-slate-950/60 border border-slate-800/80 text-center">
          <p className="text-xs text-slate-500 font-mono">
            ALU is idle.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Operation & Operands */}
          <div className="grid grid-cols-3 gap-2 text-center bg-slate-950 p-2.5 rounded border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">Operation</div>
              <div className="text-xs font-semibold font-mono text-slate-100 mt-0.5">
                {aluState.operation}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">Operands</div>
              <div className="text-xs font-semibold font-mono text-slate-300 mt-0.5">
                {aluState.operand1 !== null ? aluState.operand1 : '-'}
                {aluState.operand2 !== null ? ` , ${aluState.operand2}` : ''}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">Result</div>
              <div className="text-xs font-semibold font-mono text-slate-100 mt-0.5">
                {aluState.result !== null ? aluState.result : '-'}
              </div>
            </div>
          </div>

          {/* Hex & Binary */}
          {aluState.result !== null && (
            <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Hexadecimal:</span>
                <span className="text-slate-200 font-semibold">{toHex8(aluState.result)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Binary:</span>
                <span className="text-slate-300 font-semibold">{toBin8(aluState.result)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
