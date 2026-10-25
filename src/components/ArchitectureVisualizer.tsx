import React from 'react';
import { ActiveBuses } from '../cpu/types';

interface ArchitectureVisualizerProps {
  buses: ActiveBuses;
  regA: number;
  regB: number;
  pc: number;
  ir: string | null;
  aluOp: string | null;
  aluRes: number | null;
}

export const ArchitectureVisualizer: React.FC<ArchitectureVisualizerProps> = ({
  buses,
  regA,
  regB,
  pc,
  ir,
  aluOp,
  aluRes,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <h2 className="text-xs font-semibold tracking-wide text-slate-300 font-mono">
          CPU INTERCONNECT & DATA-FLOW DIAGRAM
        </h2>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Active Bus
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" /> Idle
          </span>
        </div>
      </div>

      {/* SVG Diagram with refined slate/neutral styling */}
      <div className="relative w-full h-56 bg-slate-950 rounded p-1 border border-slate-800/80 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 800 220">
          <defs>
            <marker
              id="arrow-active"
              markerWidth="7"
              markerHeight="7"
              refX="5"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0.5, 7 3.5, 0 6.5" fill="#e2e8f0" />
            </marker>
            <marker
              id="arrow-idle"
              markerWidth="7"
              markerHeight="7"
              refX="5"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0.5, 7 3.5, 0 6.5" fill="#475569" />
            </marker>
          </defs>

          {/* PC to Memory */}
          <path
            d="M 120 65 L 220 65"
            fill="none"
            stroke={buses.pc ? '#cbd5e1' : '#334155'}
            strokeWidth={buses.pc ? '2' : '1'}
            markerEnd={buses.pc ? 'url(#arrow-active)' : 'url(#arrow-idle)'}
          />

          {/* Memory to IR */}
          <path
            d="M 270 90 L 270 135"
            fill="none"
            stroke={buses.ir ? '#cbd5e1' : '#334155'}
            strokeWidth={buses.ir ? '2' : '1'}
            markerEnd={buses.ir ? 'url(#arrow-active)' : 'url(#arrow-idle)'}
          />

          {/* IR to Control Unit */}
          <path
            d="M 320 160 L 390 160"
            fill="none"
            stroke={buses.controlUnit ? '#cbd5e1' : '#334155'}
            strokeWidth={buses.controlUnit ? '2' : '1'}
            markerEnd={buses.controlUnit ? 'url(#arrow-active)' : 'url(#arrow-idle)'}
          />

          {/* Control Unit up to registers */}
          <path
            d="M 445 135 L 445 110"
            fill="none"
            stroke={buses.controlUnit ? '#cbd5e1' : '#334155'}
            strokeWidth="1"
            markerEnd={buses.controlUnit ? 'url(#arrow-active)' : 'url(#arrow-idle)'}
          />

          {/* Reg A to ALU */}
          <path
            d="M 490 65 L 590 65"
            fill="none"
            stroke={buses.regA && buses.alu ? '#cbd5e1' : '#334155'}
            strokeWidth={buses.regA && buses.alu ? '2' : '1'}
            markerEnd={buses.regA && buses.alu ? 'url(#arrow-active)' : 'url(#arrow-idle)'}
          />

          {/* Reg B to ALU */}
          <path
            d="M 540 95 L 590 85"
            fill="none"
            stroke={buses.regB && buses.alu ? '#cbd5e1' : '#334155'}
            strokeWidth={buses.regB && buses.alu ? '2' : '1'}
            markerEnd={buses.regB && buses.alu ? 'url(#arrow-active)' : 'url(#arrow-idle)'}
          />

          {/* ALU Output back to Reg A */}
          <path
            d="M 680 65 C 715 65, 715 20, 445 20 L 445 40"
            fill="none"
            stroke={buses.alu ? '#cbd5e1' : '#334155'}
            strokeWidth={buses.alu ? '2' : '1'}
            markerEnd={buses.alu ? 'url(#arrow-active)' : 'url(#arrow-idle)'}
          />

          {/* Memory to Registers */}
          <path
            d="M 270 65 L 390 65"
            fill="none"
            stroke={buses.memory ? '#cbd5e1' : '#334155'}
            strokeWidth={buses.memory ? '2' : '1'}
            markerEnd={buses.memory ? 'url(#arrow-active)' : 'url(#arrow-idle)'}
          />

          {/* BLOCK: PC */}
          <g>
            <rect
              x="20"
              y="40"
              width="100"
              height="50"
              rx="4"
              fill={buses.pc ? '#1e293b' : '#0f172a'}
              stroke={buses.pc ? '#64748b' : '#334155'}
              strokeWidth="1"
            />
            <text x="70" y="60" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              PROGRAM COUNTER
            </text>
            <text x="70" y="78" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="600" fontFamily="monospace">
              PC: {pc}
            </text>
          </g>

          {/* BLOCK: RAM */}
          <g>
            <rect
              x="220"
              y="40"
              width="100"
              height="50"
              rx="4"
              fill={buses.memory ? '#1e293b' : '#0f172a'}
              stroke={buses.memory ? '#64748b' : '#334155'}
              strokeWidth="1"
            />
            <text x="270" y="60" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              RAM (256 B)
            </text>
            <text x="270" y="78" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="500" fontFamily="monospace">
              {buses.memory ? 'ACCESSING' : 'READY'}
            </text>
          </g>

          {/* BLOCK: IR */}
          <g>
            <rect
              x="220"
              y="135"
              width="100"
              height="50"
              rx="4"
              fill={buses.ir ? '#1e293b' : '#0f172a'}
              stroke={buses.ir ? '#64748b' : '#334155'}
              strokeWidth="1"
            />
            <text x="270" y="155" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              INST REGISTER
            </text>
            <text x="270" y="173" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="500" fontFamily="monospace">
              {ir ? (ir.length > 11 ? ir.substring(0, 11) + '..' : ir) : 'NOP'}
            </text>
          </g>

          {/* BLOCK: CONTROL UNIT */}
          <g>
            <rect
              x="390"
              y="135"
              width="110"
              height="50"
              rx="4"
              fill={buses.controlUnit ? '#1e293b' : '#0f172a'}
              stroke={buses.controlUnit ? '#64748b' : '#334155'}
              strokeWidth="1"
            />
            <text x="445" y="155" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              CONTROL UNIT
            </text>
            <text x="445" y="173" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="500" fontFamily="monospace">
              DECODER
            </text>
          </g>

          {/* BLOCK: REGISTER A */}
          <g>
            <rect
              x="390"
              y="40"
              width="100"
              height="50"
              rx="4"
              fill={buses.regA ? '#1e293b' : '#0f172a'}
              stroke={buses.regA ? '#94a3b8' : '#334155'}
              strokeWidth="1"
            />
            <text x="440" y="60" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              REG A (ACC)
            </text>
            <text x="440" y="79" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="600" fontFamily="monospace">
              {regA}
            </text>
          </g>

          {/* BLOCK: REGISTER B */}
          <g>
            <rect
              x="450"
              y="95"
              width="90"
              height="35"
              rx="4"
              fill={buses.regB ? '#1e293b' : '#0f172a'}
              stroke={buses.regB ? '#94a3b8' : '#334155'}
              strokeWidth="1"
            />
            <text x="495" y="110" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              REG B
            </text>
            <text x="495" y="124" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="600" fontFamily="monospace">
              {regB}
            </text>
          </g>

          {/* BLOCK: ALU */}
          <g>
            <polygon
              points="590,25 680,45 680,85 590,105 590,75 610,65 590,55"
              fill={buses.alu ? '#1e293b' : '#0f172a'}
              stroke={buses.alu ? '#94a3b8' : '#334155'}
              strokeWidth="1"
            />
            <text x="640" y="60" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="600" fontFamily="monospace">
              ALU
            </text>
            <text x="640" y="75" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              {aluOp ? `${aluOp} → ${aluRes}` : 'IDLE'}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
