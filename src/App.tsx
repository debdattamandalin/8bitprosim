import { useState, useEffect, useRef, useCallback } from 'react';
import { CPUEngine } from './cpu/engine';
import { Assembler } from './cpu/assembler';
import { EXAMPLE_PROGRAMS, ExampleProgram } from './cpu/examples';
import { AssemblyError, ParsedInstruction } from './cpu/types';

import { Header } from './components/Header';
import { ExecutionControls } from './components/ExecutionControls';
import { AssemblyEditor } from './components/AssemblyEditor';
import { RegisterPanel } from './components/RegisterPanel';
import { ALUPanel } from './components/ALUPanel';
import { ArchitectureVisualizer } from './components/ArchitectureVisualizer';
import { MemoryViewer } from './components/MemoryViewer';
import { ExecutionLog } from './components/ExecutionLog';

export function App() {
  const cpuRef = useRef<CPUEngine>(new CPUEngine());

  // Editor and assembly state
  const [code, setCode] = useState<string>(EXAMPLE_PROGRAMS[0].code);
  const [errors, setErrors] = useState<AssemblyError[]>([]);
  const [parsedInstructions, setParsedInstructions] = useState<ParsedInstruction[]>([]);

  // Right-hand tab state: Memory vs Execution Log
  const [rightTab, setRightTab] = useState<'memory' | 'log'>('memory');
  const [showDiagram, setShowDiagram] = useState<boolean>(true);

  // Simulation execution settings
  const [runSpeed, setRunSpeed] = useState<number>(300);
  const timerRef = useRef<number | null>(null);

  // CPU Snapshot state
  const [cpuSnapshot, setCpuSnapshot] = useState(() => cpuRef.current.getSnapshot());
  const [logs, setLogs] = useState(() => cpuRef.current.getLogs());

  const refreshCPUState = useCallback(() => {
    setCpuSnapshot(cpuRef.current.getSnapshot());
    setLogs(cpuRef.current.getLogs());
  }, []);

  const handleAssemble = useCallback((): boolean => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const { instructions, errors: asmErrors } = Assembler.parse(code);
    setErrors(asmErrors);
    setParsedInstructions(instructions);

    if (asmErrors.length === 0) {
      cpuRef.current.loadProgram(instructions);
      refreshCPUState();
      return true;
    } else {
      cpuRef.current.reset();
      cpuRef.current.setStatus('ERROR');
      refreshCPUState();
      return false;
    }
  }, [code, refreshCPUState]);

  const handleStep = useCallback(() => {
    if (cpuSnapshot.status === 'ERROR' || parsedInstructions.length === 0) {
      const ok = handleAssemble();
      if (!ok) return;
    }

    const canContinue = cpuRef.current.step();
    refreshCPUState();

    if (!canContinue && timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [cpuSnapshot.status, parsedInstructions.length, handleAssemble, refreshCPUState]);

  const handleRun = useCallback(() => {
    if (timerRef.current !== null) return;

    if (parsedInstructions.length === 0 || cpuSnapshot.status === 'HALTED' || cpuSnapshot.status === 'ERROR') {
      const ok = handleAssemble();
      if (!ok) return;
    }

    cpuRef.current.setStatus('RUNNING');
    refreshCPUState();

    timerRef.current = window.setInterval(() => {
      const canContinue = cpuRef.current.step();
      refreshCPUState();

      if (!canContinue) {
        if (timerRef.current !== null) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, runSpeed);
  }, [parsedInstructions.length, cpuSnapshot.status, handleAssemble, refreshCPUState, runSpeed]);

  const handlePause = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (cpuRef.current.getStatus() === 'RUNNING') {
      cpuRef.current.setStatus('PAUSED');
      refreshCPUState();
    }
  }, [refreshCPUState]);

  const handleReset = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    cpuRef.current.reset();
    if (parsedInstructions.length > 0) {
      cpuRef.current.loadProgram(parsedInstructions);
    }
    refreshCPUState();
  }, [parsedInstructions, refreshCPUState]);

  const handleLoadExample = (example: ExampleProgram) => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCode(example.code);
    const { instructions, errors: asmErrors } = Assembler.parse(example.code);
    setErrors(asmErrors);
    setParsedInstructions(instructions);
    cpuRef.current.loadProgram(instructions);
    refreshCPUState();
  };

  const handleModifyByte = (address: number, val: number) => {
    cpuRef.current.writeMemory(address, val);
    refreshCPUState();
  };

  const handleClearEditor = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCode('');
    setErrors([]);
    setParsedInstructions([]);
    cpuRef.current.reset();
    refreshCPUState();
  };

  const handleClearLogs = () => {
    cpuRef.current.reset();
    refreshCPUState();
  };

  useEffect(() => {
    handleAssemble();
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        status={cpuSnapshot.status}
        onReset={handleReset}
        stepCount={cpuSnapshot.stepCount}
      />

      {/* Main Workspace Layout - Single Viewport Screen */}
      <main className="flex-1 p-3 sm:p-4 space-y-3 max-w-[1600px] w-full mx-auto flex flex-col">
        {/* Controls Toolbar with diagram toggle */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <ExecutionControls
                status={cpuSnapshot.status}
                runSpeed={runSpeed}
                onSetRunSpeed={setRunSpeed}
                onAssemble={handleAssemble}
                onStep={handleStep}
                onRun={handleRun}
                onPause={handlePause}
                onReset={handleReset}
                onLoadExample={handleLoadExample}
                hasErrors={errors.length > 0}
              />
            </div>
          </div>
        </div>

        {/* Collapsible Architecture Visualizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-slate-800">
            <span className="text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider">
              CPU Hardware Architecture Diagram
            </span>
            <button
              onClick={() => setShowDiagram(!showDiagram)}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              {showDiagram ? 'Hide Diagram ▲' : 'Show Diagram ▼'}
            </button>
          </div>
          {showDiagram && (
            <ArchitectureVisualizer
              buses={cpuSnapshot.activeBuses}
              regA={cpuSnapshot.A}
              regB={cpuSnapshot.B}
              pc={cpuSnapshot.PC}
              ir={cpuSnapshot.IR}
              aluOp={cpuSnapshot.aluState.operation}
              aluRes={cpuSnapshot.aluState.result}
            />
          )}
        </div>

        {/* 3-Column Core Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-[500px]">
          {/* Column 1: Assembly Code Editor (4 cols) */}
          <div className="lg:col-span-5 h-full flex flex-col">
            <AssemblyEditor
              code={code}
              onChange={setCode}
              errors={errors}
              currentPC={cpuSnapshot.PC}
              instructions={parsedInstructions}
              onClear={handleClearEditor}
            />
          </div>

          {/* Column 2: Registers & ALU (3.5 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-3 h-full overflow-y-auto">
            <RegisterPanel
              regA={cpuSnapshot.A}
              regB={cpuSnapshot.B}
              pc={cpuSnapshot.PC}
              ir={cpuSnapshot.IR}
              flags={cpuSnapshot.flags}
            />
            <ALUPanel aluState={cpuSnapshot.aluState} />
          </div>

          {/* Column 3: Memory & Execution Log (4 cols) */}
          <div className="lg:col-span-4 flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
            {/* Clean Tab Switcher */}
            <div className="flex items-center border-b border-slate-800 bg-slate-950 px-2 pt-1 gap-1">
              <button
                onClick={() => setRightTab('memory')}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-t border-t border-x transition-colors cursor-pointer ${
                  rightTab === 'memory'
                    ? 'bg-slate-900 text-slate-100 border-slate-700'
                    : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                Memory (256 B)
              </button>
              <button
                onClick={() => setRightTab('log')}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-t border-t border-x transition-colors cursor-pointer ${
                  rightTab === 'log'
                    ? 'bg-slate-900 text-slate-100 border-slate-700'
                    : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                Execution Log ({logs.length})
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-hidden">
              {rightTab === 'memory' ? (
                <MemoryViewer
                  memory={cpuSnapshot.memory}
                  lastAccess={cpuSnapshot.lastMemoryAccess}
                  onModifyByte={handleModifyByte}
                />
              ) : (
                <ExecutionLog logs={logs} onClearLogs={handleClearLogs} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
