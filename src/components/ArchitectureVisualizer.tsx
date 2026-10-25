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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
          CPU Interconnect & Data-Flow Visualization
        </h2>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Active Path
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-700" /> Inactive Path
          </span>
        </div>
      </div>

      {/* SVG Diagram showing real interconnected blocks and active buses */}
      <div className="relative w-full h-64 bg-slate-950/80 rounded-lg p-2 border border-slate-800/80 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 800 240">
          <defs>
            <marker
              id="arrow-cyan"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 1, 8 4, 0 7" fill="#22d3ee" />
            </marker>
            <marker
              id="arrow-slate"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 1, 8 4, 0 7" fill="#475569" />
            </marker>
          </defs>

          {/* BUS CONNECTIONS */}
          {/* PC to Memory */}
          <path
            d="M 120 70 L 220 70"
            fill="none"
            stroke={buses.pc ? '#22d3ee' : '#334155'}
            strokeWidth={buses.pc ? '2.5' : '1.5'}
            strokeDasharray={buses.pc ? '4,4' : 'none'}
            className={buses.pc ? 'animate-pulse' : ''}
            markerEnd={buses.pc ? 'url(#arrow-cyan)' : 'url(#arrow-slate)'}
          />

          {/* Memory to IR */}
          <path
            d="M 270 95 L 270 145"
            fill="none"
            stroke={buses.ir ? '#22d3ee' : '#334155'}
            strokeWidth={buses.ir ? '2.5' : '1.5'}
            markerEnd={buses.ir ? 'url(#arrow-cyan)' : 'url(#arrow-slate)'}
          />

          {/* IR to Control Unit */}
          <path
            d="M 320 170 L 400 170"
            fill="none"
            stroke={buses.controlUnit ? '#22d3ee' : '#334155'}
            strokeWidth={buses.controlUnit ? '2.5' : '1.5'}
            markerEnd={buses.controlUnit ? 'url(#arrow-cyan)' : 'url(#arrow-slate)'}
          />

          {/* Control Unit signals up to ALU and Registers */}
          <path
            d="M 450 145 L 450 115"
            fill="none"
            stroke={buses.controlUnit ? '#22d3ee' : '#334155'}
            strokeWidth="1.5"
            markerEnd={buses.controlUnit ? 'url(#arrow-cyan)' : 'url(#arrow-slate)'}
          />

          {/* Register A to ALU */}
          <path
            d="M 490 70 L 590 70"
            fill="none"
            stroke={buses.regA && buses.alu ? '#22d3ee' : '#334155'}
            strokeWidth={buses.regA && buses.alu ? '2.5' : '1.5'}
            markerEnd={buses.regA && buses.alu ? 'url(#arrow-cyan)' : 'url(#arrow-slate)'}
          />

          {/* Register B to ALU */}
          <path
            d="M 540 100 L 590 90"
            fill="none"
            stroke={buses.regB && buses.alu ? '#22d3ee' : '#334155'}
            strokeWidth={buses.regB && buses.alu ? '2.5' : '1.5'}
            markerEnd={buses.regB && buses.alu ? 'url(#arrow-cyan)' : 'url(#arrow-slate)'}
          />

          {/* ALU Output loop back to Register A */}
          <path
            d="M 680 70 C 720 70, 720 20, 450 20 L 450 45"
            fill="none"
            stroke={buses.alu ? '#22d3ee' : '#334155'}
            strokeWidth={buses.alu ? '2.5' : '1.5'}
            markerEnd={buses.alu ? 'url(#arrow-cyan)' : 'url(#arrow-slate)'}
          />

          {/* Memory to Registers Data Bus (Bottom bidirectional) */}
          <path
            d="M 270 70 L 390 70"
            fill="none"
            stroke={buses.memory ? '#22d3ee' : '#334155'}
            strokeWidth={buses.memory ? '2.5' : '1.5'}
            markerEnd={buses.memory ? 'url(#arrow-cyan)' : 'url(#arrow-slate)'}
          />

          {/* BLOCK 1: PROGRAM COUNTER (PC) */}
          <g>
            <rect
              x="20"
              y="45"
              width="100"
              height="50"
              rx="6"
              fill={buses.pc ? '#1e293b' : '#0f172a'}
              stroke={buses.pc ? '#22d3ee' : '#334155'}
              strokeWidth={buses.pc ? '2' : '1'}
            />
            <text x="70" y="66" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              PROGRAM COUNTER
            </text>
            <text x="70" y="84" textAnchor="middle" fill={buses.pc ? '#38bdf8' : '#e2e8f0'} fontSize="13" fontWeight="bold" fontFamily="monospace">
              PC: {pc}
            </text>
          </g>

          {/* BLOCK 2: MEMORY */}
          <g>
            <rect
              x="220"
              y="45"
              width="100"
              height="50"
              rx="6"
              fill={buses.memory ? '#1e293b' : '#0f172a'}
              stroke={buses.memory ? '#22d3ee' : '#334155'}
              strokeWidth={buses.memory ? '2' : '1'}
            />
            <text x="270" y="66" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              RAM (256 B)
            </text>
            <text x="270" y="84" textAnchor="middle" fill={buses.memory ? '#38bdf8' : '#cbd5e1'} fontSize="11" fontWeight="bold" fontFamily="monospace">
              {buses.memory ? 'ACCESSING' : 'READY'}
            </text>
          </g>

          {/* BLOCK 3: INSTRUCTION REGISTER (IR) */}
          <g>
            <rect
              x="220"
              y="145"
              width="100"
              height="50"
              rx="6"
              fill={buses.ir ? '#1e293b' : '#0f172a'}
              stroke={buses.ir ? '#a855f7' : '#334155'}
              strokeWidth={buses.ir ? '2' : '1'}
            />
            <text x="270" y="165" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              INST REGISTER
            </text>
            <text x="270" y="183" textAnchor="middle" fill="#d8b4fe" fontSize="10" fontWeight="bold" fontFamily="monospace">
              {ir ? (ir.length > 10 ? ir.substring(0, 10) + '..' : ir) : 'EMPTY'}
            </text>
          </g>

          {/* BLOCK 4: CONTROL UNIT */}
          <g>
            <rect
              x="390"
              y="145"
              width="120"
              height="50"
              rx="6"
              fill={buses.controlUnit ? '#1e293b' : '#0f172a'}
              stroke={buses.controlUnit ? '#38bdf8' : '#334155'}
              strokeWidth={buses.controlUnit ? '2' : '1'}
            />
            <text x="450" y="166" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              CONTROL UNIT
            </text>
            <text x="450" y="184" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
              DECODE & SYNC
            </text>
          </g>

          {/* BLOCK 5: REGISTER A (ACCUMULATOR) */}
          <g>
            <rect
              x="390"
              y="45"
              width="100"
              height="50"
              rx="6"
              fill={buses.regA ? '#164e63' : '#0f172a'}
              stroke={buses.regA ? '#22d3ee' : '#334155'}
              strokeWidth={buses.regA ? '2' : '1'}
            />
            <text x="440" y="65" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              REGISTER A (ACC)
            </text>
            <text x="440" y="84" textAnchor="middle" fill="#22d3ee" fontSize="14" fontWeight="bold" fontFamily="monospace">
              {regA}
            </text>
          </g>

          {/* BLOCK 6: REGISTER B */}
          <g>
            <rect
              x="450"
              y="100"
              width="90"
              height="35"
              rx="6"
              fill={buses.regB ? '#1e293b' : '#0f172a'}
              stroke={buses.regB ? '#22d3ee' : '#334155'}
              strokeWidth={buses.regB ? '2' : '1'}
            />
            <text x="495" y="115" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              REGISTER B
            </text>
            <text x="495" y="129" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold" fontFamily="monospace">
              {regB}
            </text>
          </g>

          {/* BLOCK 7: ALU */}
          <g>
            <polygon
              points="590,30 680,50 680,90 590,110 590,80 610,70 590,60"
              fill={buses.alu ? '#064e3b' : '#0f172a'}
              stroke={buses.alu ? '#10b981' : '#334155'}
              strokeWidth={buses.alu ? '2' : '1'}
            />
            <text x="640" y="65" textAnchor="middle" fill="#6ee7b7" fontSize="12" fontWeight="bold" fontFamily="monospace">
              ALU
            </text>
            <text x="640" y="80" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontFamily="monospace">
              {aluOp ? `${aluOp} → ${aluRes}` : 'IDLE'}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
