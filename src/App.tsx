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
  // Underlying CPU Hardware Engine instance
  const cpuRef = useRef<CPUEngine>(new CPUEngine());

  // Editor and assembly state
  const [code, setCode] = useState<string>(EXAMPLE_PROGRAMS[0].code);
  const [errors, setErrors] = useState<AssemblyError[]>([]);
  const [parsedInstructions, setParsedInstructions] = useState<ParsedInstruction[]>([]);

  // Simulation execution settings
  const [runSpeed, setRunSpeed] = useState<number>(300); // ms per step
  const timerRef = useRef<number | null>(null);

  // CPU Snapshot state for React reactivity
  const [cpuSnapshot, setCpuSnapshot] = useState(() => cpuRef.current.getSnapshot());
  const [logs, setLogs] = useState(() => cpuRef.current.getLogs());

  // Refresh reactive snapshot from the real engine
  const refreshCPUState = useCallback(() => {
    setCpuSnapshot(cpuRef.current.getSnapshot());
    setLogs(cpuRef.current.getLogs());
  }, []);

  // Assemble current source code
  const handleAssemble = useCallback((): boolean => {
    // Stop any active continuous run
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

  // Execute one step
  const handleStep = useCallback(() => {
    // If not assembled or status was halted/error, assemble first
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

  // Run continuous loop
  const handleRun = useCallback(() => {
    if (timerRef.current !== null) return; // Prevent multiple loops

    // Assemble if needed
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

  // Pause
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

  // Hardware Reset
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

  // Load Example Program
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

  // Modify Memory byte manually
  const handleModifyByte = (address: number, val: number) => {
    cpuRef.current.writeMemory(address, val);
    refreshCPUState();
  };

  // Clear Editor
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

  // Clear Logs
  const handleClearLogs = () => {
    cpuRef.current.reset();
    refreshCPUState();
  };

  // Initial auto-assemble on launch
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

      {/* Main Workspace Layout */}
      <main className="flex-1 p-4 sm:p-6 space-y-4 max-w-[1600px] w-full mx-auto">
        {/* Controls Toolbar */}
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

        {/* Dynamic Architectural Block Visualizer */}
        <ArchitectureVisualizer
          buses={cpuSnapshot.activeBuses}
          regA={cpuSnapshot.A}
          regB={cpuSnapshot.B}
          pc={cpuSnapshot.PC}
          ir={cpuSnapshot.IR}
          aluOp={cpuSnapshot.aluState.operation}
          aluRes={cpuSnapshot.aluState.result}
        />

        {/* 3-Column Laboratory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[640px]">
          {/* Column 1: Assembly Editor (4 cols) */}
          <div className="lg:col-span-4 h-full">
            <AssemblyEditor
              code={code}
              onChange={setCode}
              errors={errors}
              currentPC={cpuSnapshot.PC}
              instructions={parsedInstructions}
              onClear={handleClearEditor}
            />
          </div>

          {/* Column 2: Registers & ALU (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4 h-full overflow-y-auto pr-1">
            <RegisterPanel
              regA={cpuSnapshot.A}
              regB={cpuSnapshot.B}
              pc={cpuSnapshot.PC}
              ir={cpuSnapshot.IR}
              flags={cpuSnapshot.flags}
            />
            <ALUPanel aluState={cpuSnapshot.aluState} />
          </div>

          {/* Column 3: Memory Viewer & Real-time Execution Log (4 cols) */}
          <div className="lg:col-span-4 grid grid-rows-2 gap-4 h-full">
            <div className="h-full min-h-[300px]">
              <MemoryViewer
                memory={cpuSnapshot.memory}
                lastAccess={cpuSnapshot.lastMemoryAccess}
                onModifyByte={handleModifyByte}
              />
            </div>
            <div className="h-full min-h-[300px]">
              <ExecutionLog logs={logs} onClearLogs={handleClearLogs} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
