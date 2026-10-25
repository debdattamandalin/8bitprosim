import { ALU } from './alu';
import {
  CPUFlags,
  CPUStatus,
  ALUState,
  ActiveBuses,
  LogEntry,
  ParsedInstruction,
  CPUStateSnapshot,
  RegisterName,
} from './types';

/**
 * 8-Bit CPU Engine
 * Independent execution core implementing the full Fetch-Decode-Execute cycle.
 */
export class CPUEngine {
  // Registers (8-bit)
  private A: number = 0;
  private B: number = 0;

  // Program Counter (sequential instruction address)
  private PC: number = 0;

  // Instruction Register
  private IR: string | null = null;

  // Status flags
  private flags: CPUFlags = {
    Z: false,
    C: false,
    S: false,
    V: false,
  };

  // 256 bytes of data memory
  private memory: Uint8Array = new Uint8Array(256);

  // CPU status
  private status: CPUStatus = 'READY';
  private errorMessage: string | null = null;

  // Instruction space (separate from data memory as requested)
  private instructions: ParsedInstruction[] = [];

  // Logs & statistics
  private logs: LogEntry[] = [];
  private stepCount: number = 0;
  public static readonly MAX_EXECUTION_LIMIT = 50000;

  // ALU state tracking for visualization
  private aluState: ALUState = {
    operation: null,
    operand1: null,
    operand2: null,
    result: null,
    flags: { Z: false, C: false, S: false, V: false },
  };

  // Bus activation signals for visual diagram
  private activeBuses: ActiveBuses = {
    controlUnit: false,
    alu: false,
    regA: false,
    regB: false,
    pc: false,
    ir: false,
    memory: false,
  };

  private lastMemoryAccess?: { address: number; type: 'READ' | 'WRITE' };

  constructor() {
    this.reset();
  }

  /**
   * Complete CPU hardware reset
   */
  public reset(): void {
    this.A = 0;
    this.B = 0;
    this.PC = 0;
    this.IR = null;
    this.flags = { Z: false, C: false, S: false, V: false };
    this.memory = new Uint8Array(256);
    this.status = 'READY';
    this.errorMessage = null;
    this.stepCount = 0;
    this.logs = [];
    this.lastMemoryAccess = undefined;
    this.aluState = {
      operation: null,
      operand1: null,
      operand2: null,
      result: null,
      flags: { Z: false, C: false, S: false, V: false },
    };
    this.activeBuses = {
      controlUnit: false,
      alu: false,
      regA: false,
      regB: false,
      pc: false,
      ir: false,
      memory: false,
    };
  }

  /**
   * Load assembled program instructions into instruction memory
   */
  public loadProgram(instructions: ParsedInstruction[]): void {
    this.reset();
    this.instructions = instructions;
    this.status = instructions.length > 0 ? 'READY' : 'HALTED';
  }

  /**
   * Get register value
   */
  public getRegister(reg: RegisterName): number {
    return reg === 'A' ? this.A : this.B;
  }

  /**
   * Set register value (enforcing 8-bit clamp)
   */
  public setRegister(reg: RegisterName, val: number): void {
    const clamped = val & 0xff;
    if (reg === 'A') {
      this.A = clamped;
    } else {
      this.B = clamped;
    }
  }

  /**
   * Direct read from data memory
   */
  public readMemory(address: number): number {
    if (address < 0 || address > 255) {
      throw new Error(`Memory address out of bounds: ${address}`);
    }
    return this.memory[address];
  }

  /**
   * Direct write to data memory
   */
  public writeMemory(address: number, value: number): void {
    if (address < 0 || address > 255) {
      throw new Error(`Memory address out of bounds: ${address}`);
    }
    this.memory[address] = value & 0xff;
  }

  public getSnapshot(): CPUStateSnapshot {
    return {
      A: this.A,
      B: this.B,
      PC: this.PC,
      IR: this.IR,
      flags: { ...this.flags },
      memory: new Uint8Array(this.memory),
      status: this.status,
      errorMessage: this.errorMessage,
      aluState: { ...this.aluState, flags: { ...this.aluState.flags } },
      activeBuses: { ...this.activeBuses },
      stepCount: this.stepCount,
      lastMemoryAccess: this.lastMemoryAccess ? { ...this.lastMemoryAccess } : undefined,
    };
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public getInstructions(): ParsedInstruction[] {
    return [...this.instructions];
  }

  public getStatus(): CPUStatus {
    return this.status;
  }

  public setStatus(s: CPUStatus): void {
    this.status = s;
  }

  private addLog(
    stage: 'FETCH' | 'DECODE' | 'EXECUTE' | 'HALT' | 'ERROR',
    details: string,
    pc: number,
    instStr: string,
    extra?: {
      memoryChange?: { address: number; value: number };
      aluResult?: number;
    }
  ): void {
    const entry: LogEntry = {
      id: `${Date.now()}-${this.logs.length}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      stepNumber: this.stepCount,
      pc,
      instructionStr: instStr,
      stage,
      details,
      regA: this.A,
      regB: this.B,
      flags: { ...this.flags },
      memoryChange: extra?.memoryChange,
      aluResult: extra?.aluResult,
    };
    this.logs.push(entry);
  }

  /**
   * Executes a single fetch-decode-execute cycle
   * Returns true if execution can continue, false if HALTED or ERROR.
   */
  public step(): boolean {
    if (this.status === 'HALTED' || this.status === 'ERROR') {
      return false;
    }

    if (this.instructions.length === 0) {
      this.status = 'HALTED';
      this.addLog('HALT', 'No program loaded.', this.PC, 'NONE');
      return false;
    }

    // Check execution count limit to prevent infinite loops
    if (this.stepCount >= CPUEngine.MAX_EXECUTION_LIMIT) {
      this.status = 'ERROR';
      this.errorMessage = `Execution limit exceeded (${CPUEngine.MAX_EXECUTION_LIMIT} instructions). Possible infinite loop.`;
      this.addLog('ERROR', this.errorMessage, this.PC, 'LOOP_LIMIT');
      return false;
    }

    // 1. FETCH
    if (this.PC < 0 || this.PC >= this.instructions.length) {
      // Reached past end of program without HALT
      this.status = 'HALTED';
      this.addLog('HALT', 'End of program reached (PC out of instruction range).', this.PC, 'EOF');
      return false;
    }

    const currentInst = this.instructions[this.PC];
    const originalPC = this.PC;
    this.IR = currentInst.rawText.trim();
    this.stepCount++;

    // Reset active visual signals
    this.activeBuses = {
      controlUnit: true,
      alu: false,
      regA: false,
      regB: false,
      pc: true,
      ir: true,
      memory: false,
    };
    this.lastMemoryAccess = undefined;
    this.aluState.operation = null;

    // 2. DECODE & EXECUTE
    let nextPC = originalPC + 1;
    let details = '';
    let memChange: { address: number; value: number } | undefined;
    let aluResultVal: number | undefined;

    const opcode = currentInst.opcode;
    const arg1 = currentInst.parsedArg1;
    const arg2 = currentInst.parsedArg2;

    try {
      switch (opcode) {
        // --- DATA TRANSFER ---
        case 'LOAD': {
          const destReg = arg1?.value as RegisterName;
          if (arg2?.type === 'IMMEDIATE') {
            const val = arg2.value as number;
            this.setRegister(destReg, val);
            this.activeBuses[destReg === 'A' ? 'regA' : 'regB'] = true;
            this.activeBuses.immToReg = true;
            details = `Loaded immediate ${val} into Register ${destReg}`;
          } else if (arg2?.type === 'INDIRECT') {
            const addr = arg2.value as number;
            const val = this.readMemory(addr);
            this.setRegister(destReg, val);
            this.activeBuses.memory = true;
            this.activeBuses[destReg === 'A' ? 'regA' : 'regB'] = true;
            this.activeBuses.memoryToReg = true;
            this.lastMemoryAccess = { address: addr, type: 'READ' };
            details = `Loaded value ${val} from Memory[${addr}] into Register ${destReg}`;
          }
          break;
        }

        case 'MOV': {
          const dest = arg1?.value as RegisterName;
          const src = arg2?.value as RegisterName;
          const val = this.getRegister(src);
          this.setRegister(dest, val);
          this.activeBuses.regA = true;
          this.activeBuses.regB = true;
          details = `Moved value ${val} from Register ${src} to Register ${dest}`;
          break;
        }

        case 'STORE': {
          const addr = arg1?.value as number;
          const srcReg = arg2?.value as RegisterName;
          const val = this.getRegister(srcReg);
          this.writeMemory(addr, val);
          this.activeBuses[srcReg === 'A' ? 'regA' : 'regB'] = true;
          this.activeBuses.memory = true;
          this.activeBuses.regToMemory = true;
          this.lastMemoryAccess = { address: addr, type: 'WRITE' };
          memChange = { address: addr, value: val };
          details = `Stored Register ${srcReg} (${val}) into Memory[${addr}]`;
          break;
        }

        // --- ARITHMETIC ---
        case 'ADD': {
          // ADD A, B
          this.activeBuses.alu = true;
          this.activeBuses.regA = true;
          this.activeBuses.regB = true;
          this.activeBuses.regToAlu = true;
          this.activeBuses.aluToReg = true;

          const res = ALU.add(this.A, this.B);
          this.aluState = {
            operation: 'ADD',
            operand1: this.A,
            operand2: this.B,
            result: res.value,
            flags: { ...res.flags },
          };
          this.A = res.value;
          this.flags = { ...res.flags };
          aluResultVal = res.value;
          details = `ADD A, B -> A = ${res.value} (Flags: Z=${+this.flags.Z} C=${+this.flags.C} S=${+this.flags.S} V=${+this.flags.V})`;
          break;
        }

        case 'SUB': {
          // SUB A, B
          this.activeBuses.alu = true;
          this.activeBuses.regA = true;
          this.activeBuses.regB = true;
          this.activeBuses.regToAlu = true;
          this.activeBuses.aluToReg = true;

          const res = ALU.sub(this.A, this.B);
          this.aluState = {
            operation: 'SUB',
            operand1: this.A,
            operand2: this.B,
            result: res.value,
            flags: { ...res.flags },
          };
          this.A = res.value;
          this.flags = { ...res.flags };
          aluResultVal = res.value;
          details = `SUB A, B -> A = ${res.value} (Flags: Z=${+this.flags.Z} C=${+this.flags.C} S=${+this.flags.S} V=${+this.flags.V})`;
          break;
        }

        case 'INC': {
          const reg = arg1?.value as RegisterName;
          const currentVal = this.getRegister(reg);
          this.activeBuses.alu = true;
          this.activeBuses[reg === 'A' ? 'regA' : 'regB'] = true;

          const res = ALU.inc(currentVal);
          this.aluState = {
            operation: 'INC',
            operand1: currentVal,
            operand2: 1,
            result: res.value,
            flags: { ...res.flags },
          };
          this.setRegister(reg, res.value);
          this.flags = { ...res.flags };
          aluResultVal = res.value;
          details = `INC ${reg} -> ${reg} = ${res.value} (Flags: Z=${+this.flags.Z} C=${+this.flags.C} S=${+this.flags.S} V=${+this.flags.V})`;
          break;
        }

        case 'DEC': {
          const reg = arg1?.value as RegisterName;
          const currentVal = this.getRegister(reg);
          this.activeBuses.alu = true;
          this.activeBuses[reg === 'A' ? 'regA' : 'regB'] = true;

          const res = ALU.dec(currentVal);
          this.aluState = {
            operation: 'DEC',
            operand1: currentVal,
            operand2: 1,
            result: res.value,
            flags: { ...res.flags },
          };
          this.setRegister(reg, res.value);
          this.flags = { ...res.flags };
          aluResultVal = res.value;
          details = `DEC ${reg} -> ${reg} = ${res.value} (Flags: Z=${+this.flags.Z} C=${+this.flags.C} S=${+this.flags.S} V=${+this.flags.V})`;
          break;
        }

        // --- LOGICAL ---
        case 'AND': {
          const r1 = arg1?.value as RegisterName;
          const r2 = arg2?.value as RegisterName;
          this.activeBuses.alu = true;
          this.activeBuses.regA = true;
          this.activeBuses.regB = true;

          const res = ALU.and(this.getRegister(r1), this.getRegister(r2));
          this.aluState = {
            operation: 'AND',
            operand1: this.getRegister(r1),
            operand2: this.getRegister(r2),
            result: res.value,
            flags: { ...res.flags },
          };
          this.setRegister(r1, res.value);
          this.flags = { ...res.flags };
          aluResultVal = res.value;
          details = `AND ${r1}, ${r2} -> ${r1} = ${res.value} (Flags: Z=${+this.flags.Z} S=${+this.flags.S})`;
          break;
        }

        case 'OR': {
          const r1 = arg1?.value as RegisterName;
          const r2 = arg2?.value as RegisterName;
          this.activeBuses.alu = true;
          this.activeBuses.regA = true;
          this.activeBuses.regB = true;

          const res = ALU.or(this.getRegister(r1), this.getRegister(r2));
          this.aluState = {
            operation: 'OR',
            operand1: this.getRegister(r1),
            operand2: this.getRegister(r2),
            result: res.value,
            flags: { ...res.flags },
          };
          this.setRegister(r1, res.value);
          this.flags = { ...res.flags };
          aluResultVal = res.value;
          details = `OR ${r1}, ${r2} -> ${r1} = ${res.value} (Flags: Z=${+this.flags.Z} S=${+this.flags.S})`;
          break;
        }

        case 'XOR': {
          const r1 = arg1?.value as RegisterName;
          const r2 = arg2?.value as RegisterName;
          this.activeBuses.alu = true;
          this.activeBuses.regA = true;
          this.activeBuses.regB = true;

          const res = ALU.xor(this.getRegister(r1), this.getRegister(r2));
          this.aluState = {
            operation: 'XOR',
            operand1: this.getRegister(r1),
            operand2: this.getRegister(r2),
            result: res.value,
            flags: { ...res.flags },
          };
          this.setRegister(r1, res.value);
          this.flags = { ...res.flags };
          aluResultVal = res.value;
          details = `XOR ${r1}, ${r2} -> ${r1} = ${res.value} (Flags: Z=${+this.flags.Z} S=${+this.flags.S})`;
          break;
        }

        case 'NOT': {
          const reg = arg1?.value as RegisterName;
          this.activeBuses.alu = true;
          this.activeBuses[reg === 'A' ? 'regA' : 'regB'] = true;

          const res = ALU.not(this.getRegister(reg));
          this.aluState = {
            operation: 'NOT',
            operand1: this.getRegister(reg),
            operand2: null,
            result: res.value,
            flags: { ...res.flags },
          };
          this.setRegister(reg, res.value);
          this.flags = { ...res.flags };
          aluResultVal = res.value;
          details = `NOT ${reg} -> ${reg} = ${res.value} (Flags: Z=${+this.flags.Z} S=${+this.flags.S})`;
          break;
        }

        // --- CONTROL FLOW ---
        case 'JMP': {
          const target = arg1?.value as number;
          if (target < 0 || target >= this.instructions.length) {
            throw new Error(`Jump target out of bounds: address ${target}`);
          }
          nextPC = target;
          this.activeBuses.pc = true;
          details = `Unconditional Jump to address ${target}`;
          break;
        }

        case 'JZ': {
          const target = arg1?.value as number;
          if (this.flags.Z) {
            if (target < 0 || target >= this.instructions.length) {
              throw new Error(`Jump target out of bounds: address ${target}`);
            }
            nextPC = target;
            details = `Jump to address ${target} taken (Zero Flag = 1)`;
          } else {
            details = `Jump to address ${target} skipped (Zero Flag = 0)`;
          }
          this.activeBuses.pc = true;
          break;
        }

        case 'JNZ': {
          const target = arg1?.value as number;
          if (!this.flags.Z) {
            if (target < 0 || target >= this.instructions.length) {
              throw new Error(`Jump target out of bounds: address ${target}`);
            }
            nextPC = target;
            details = `Jump to address ${target} taken (Zero Flag = 0)`;
          } else {
            details = `Jump to address ${target} skipped (Zero Flag = 1)`;
          }
          this.activeBuses.pc = true;
          break;
        }

        case 'JC': {
          const target = arg1?.value as number;
          if (this.flags.C) {
            if (target < 0 || target >= this.instructions.length) {
              throw new Error(`Jump target out of bounds: address ${target}`);
            }
            nextPC = target;
            details = `Jump to address ${target} taken (Carry Flag = 1)`;
          } else {
            details = `Jump to address ${target} skipped (Carry Flag = 0)`;
          }
          this.activeBuses.pc = true;
          break;
        }

        case 'HALT': {
          this.status = 'HALTED';
          details = 'CPU Execution Halted';
          this.addLog('HALT', details, originalPC, currentInst.rawText);
          return false;
        }

        default:
          throw new Error(`Unsupported opcode in execution: ${opcode}`);
      }

      // Commit next PC
      this.PC = nextPC;

      // Add execution log
      this.addLog('EXECUTE', details, originalPC, currentInst.rawText, {
        memoryChange: memChange,
        aluResult: aluResultVal,
      });

      return true;
    } catch (err: unknown) {
      this.status = 'ERROR';
      this.errorMessage = err instanceof Error ? err.message : String(err);
      this.addLog('ERROR', this.errorMessage, originalPC, currentInst.rawText);
      return false;
    }
  }

  /**
   * Run continuously until HALT, ERROR, or max execution limit
   */
  public runSync(maxSteps: number = CPUEngine.MAX_EXECUTION_LIMIT): CPUStatus {
    this.status = 'RUNNING';
    let steps = 0;
    while (this.status === 'RUNNING' && steps < maxSteps) {
      const canContinue = this.step();
      steps++;
      if (!canContinue) {
        break;
      }
    }

    if (steps >= maxSteps && this.status === 'RUNNING') {
      this.status = 'ERROR';
      this.errorMessage = `Execution limit exceeded (${maxSteps} steps). Possible infinite loop.`;
      this.addLog('ERROR', this.errorMessage, this.PC, 'LOOP_LIMIT');
    }

    return this.status;
  }
}
