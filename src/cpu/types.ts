export type RegisterName = 'A' | 'B';

export interface CPUFlags {
  Z: boolean; // Zero flag
  C: boolean; // Carry flag (unsigned overflow / borrow)
  S: boolean; // Sign flag (MSB == 1)
  V: boolean; // Overflow flag (signed overflow)
}

export type CPUStatus = 'READY' | 'RUNNING' | 'PAUSED' | 'HALTED' | 'ERROR';

export type ALUOperation = 'ADD' | 'SUB' | 'INC' | 'DEC' | 'AND' | 'OR' | 'XOR' | 'NOT' | null;

export interface ALUState {
  operation: ALUOperation;
  operand1: number | null;
  operand2: number | null;
  result: number | null;
  flags: CPUFlags;
}

export interface ActiveBuses {
  controlUnit: boolean;
  alu: boolean;
  regA: boolean;
  regB: boolean;
  pc: boolean;
  ir: boolean;
  memory: boolean;
  // Directed active signals
  pcToMemory?: boolean;
  memoryToIr?: boolean;
  regToAlu?: boolean;
  aluToReg?: boolean;
  regToMemory?: boolean;
  memoryToReg?: boolean;
  immToReg?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  stepNumber: number;
  pc: number;
  instructionStr: string;
  stage: 'FETCH' | 'DECODE' | 'EXECUTE' | 'HALT' | 'ERROR';
  details: string;
  regA?: number;
  regB?: number;
  memoryChange?: { address: number; value: number };
  flags?: CPUFlags;
  aluResult?: number;
}

export interface ParsedInstruction {
  lineIndex: number;
  address: number;
  rawText: string;
  opcode: string;
  arg1?: string;
  arg2?: string;
  parsedArg1?: { type: 'REGISTER' | 'IMMEDIATE' | 'DIRECT' | 'INDIRECT'; value: string | number };
  parsedArg2?: { type: 'REGISTER' | 'IMMEDIATE' | 'DIRECT' | 'INDIRECT'; value: string | number };
}

export interface AssemblyError {
  line: number; // 1-based
  message: string;
}

export interface CPUStateSnapshot {
  A: number;
  B: number;
  PC: number;
  IR: string | null;
  flags: CPUFlags;
  memory: Uint8Array;
  status: CPUStatus;
  errorMessage: string | null;
  aluState: ALUState;
  activeBuses: ActiveBuses;
  stepCount: number;
  lastMemoryAccess?: { address: number; type: 'READ' | 'WRITE' };
}
