import { describe, it, expect, beforeEach } from 'vitest';
import { ALU } from '../src/cpu/alu';
import { Assembler } from '../src/cpu/assembler';
import { CPUEngine } from '../src/cpu/engine';

describe('ALU Operations and Flag Verification', () => {
  it('correctly handles basic ADD', () => {
    const res = ALU.add(10, 20);
    expect(res.value).toBe(30);
    expect(res.flags).toEqual({ Z: false, C: false, S: false, V: false });
  });

  it('verifies boundary case: 255 + 1 = 0, with carry set', () => {
    const res = ALU.add(255, 1);
    expect(res.value).toBe(0);
    expect(res.flags.Z).toBe(true);
    expect(res.flags.C).toBe(true);
    expect(res.flags.S).toBe(false);
    expect(res.flags.V).toBe(false);
  });

  it('verifies boundary case: 200 + 100 = 44, with carry set', () => {
    const res = ALU.add(200, 100);
    expect(res.value).toBe(44); // (300 & 0xff) = 44
    expect(res.flags.C).toBe(true);
    expect(res.flags.Z).toBe(false);
  });

  it('verifies boundary case: 127 + 1 = 128, with signed overflow set', () => {
    const res = ALU.add(127, 1);
    expect(res.value).toBe(128);
    expect(res.flags.V).toBe(true); // Signed overflow from +127 to -128
    expect(res.flags.S).toBe(true); // MSB is 1
    expect(res.flags.C).toBe(false);
    expect(res.flags.Z).toBe(false);
  });

  it('verifies boundary case: 0 - 1 = 255 with carry (borrow) set', () => {
    const res = ALU.sub(0, 1);
    expect(res.value).toBe(255);
    expect(res.flags.C).toBe(true); // Borrow occurred
    expect(res.flags.S).toBe(true); // MSB is 1
    expect(res.flags.Z).toBe(false);
    expect(res.flags.V).toBe(false);
  });

  it('verifies signed overflow on subtraction: -128 - 1 = 127', () => {
    // 128 is -128 signed
    const res = ALU.sub(128, 1);
    expect(res.value).toBe(127);
    expect(res.flags.V).toBe(true);
  });

  it('verifies INC and DEC operations', () => {
    expect(ALU.inc(15).value).toBe(16);
    expect(ALU.dec(16).value).toBe(15);
    expect(ALU.dec(1).flags.Z).toBe(true);
  });

  it('verifies logical operations (AND, OR, XOR, NOT)', () => {
    // AND: 12 & 10 = 8
    const andRes = ALU.and(12, 10);
    expect(andRes.value).toBe(8);
    expect(andRes.flags.Z).toBe(false);

    // OR: 12 | 10 = 14
    const orRes = ALU.or(12, 10);
    expect(orRes.value).toBe(14);

    // XOR: 12 ^ 10 = 6
    const xorRes = ALU.xor(12, 10);
    expect(xorRes.value).toBe(6);

    // NOT: ~0 = 255
    const notRes = ALU.not(0);
    expect(notRes.value).toBe(255);
    expect(notRes.flags.S).toBe(true);
  });
});

describe('Assembler Validation', () => {
  it('parses valid assembly instructions and labels', () => {
    const code = `
      LOAD A, 10
      LOAD B, 20
      ADD A, B
      STORE 50, A
      HALT
    `;
    const { instructions, errors } = Assembler.parse(code);
    expect(errors.length).toBe(0);
    expect(instructions.length).toBe(5);
    expect(instructions[0].opcode).toBe('LOAD');
    expect(instructions[2].opcode).toBe('ADD');
  });

  it('detects invalid opcodes', () => {
    const code = `FOOBAR A, B`;
    const { errors } = Assembler.parse(code);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain("Unknown instruction or opcode");
  });

  it('detects out-of-range memory addresses', () => {
    const code = `STORE 300, A`;
    const { errors } = Assembler.parse(code);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain("must be between 0 and 255");
  });

  it('detects invalid operands and register names', () => {
    const code = `LOAD C, 10`;
    const { errors } = Assembler.parse(code);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain("Must be A or B");
  });

  it('resolves labels to addresses', () => {
    const code = `
      LOAD A, 5
      LOOP:
      DEC A
      JNZ LOOP
      HALT
    `;
    const { instructions, errors, labelMap } = Assembler.parse(code);
    expect(errors.length).toBe(0);
    expect(labelMap['LOOP']).toBe(1);
    expect(instructions[2].parsedArg1?.value).toBe(1); // JNZ target
  });
});

describe('CPU Engine Execution', () => {
  let cpu: CPUEngine;

  beforeEach(() => {
    cpu = new CPUEngine();
  });

  it('executes Example 1 (Addition)', () => {
    const code = `
      LOAD A, 10
      LOAD B, 20
      ADD A, B
      STORE 50, A
      HALT
    `;
    const { instructions } = Assembler.parse(code);
    cpu.loadProgram(instructions);
    const status = cpu.runSync();

    expect(status).toBe('HALTED');
    expect(cpu.getRegister('A')).toBe(30);
    expect(cpu.getRegister('B')).toBe(20);
    expect(cpu.readMemory(50)).toBe(30);
  });

  it('executes Example 2 (Subtraction)', () => {
    const code = `
      LOAD A, 50
      LOAD B, 20
      SUB A, B
      STORE 51, A
      HALT
    `;
    const { instructions } = Assembler.parse(code);
    cpu.loadProgram(instructions);
    cpu.runSync();

    expect(cpu.getRegister('A')).toBe(30);
    expect(cpu.readMemory(51)).toBe(30);
  });

  it('executes Example 3 (Logical AND)', () => {
    const code = `
      LOAD A, 12
      LOAD B, 10
      AND A, B
      STORE 52, A
      HALT
    `;
    const { instructions } = Assembler.parse(code);
    cpu.loadProgram(instructions);
    cpu.runSync();

    expect(cpu.getRegister('A')).toBe(8);
    expect(cpu.readMemory(52)).toBe(8);
  });

  it('executes Example 4 (Increment)', () => {
    const code = `
      LOAD A, 15
      INC A
      STORE 53, A
      HALT
    `;
    const { instructions } = Assembler.parse(code);
    cpu.loadProgram(instructions);
    cpu.runSync();

    expect(cpu.getRegister('A')).toBe(16);
    expect(cpu.readMemory(53)).toBe(16);
  });

  it('executes Example 5 (Conditional Jump Loop: Sum 5 down to 1)', () => {
    const code = `
      LOAD A, 0
      LOAD B, 5
      LOOP:
      ADD A, B
      DEC B
      JNZ LOOP
      STORE 60, A
      HALT
    `;
    const { instructions } = Assembler.parse(code);
    cpu.loadProgram(instructions);
    cpu.runSync();

    expect(cpu.getRegister('A')).toBe(15); // 5 + 4 + 3 + 2 + 1
    expect(cpu.getRegister('B')).toBe(0);
    expect(cpu.readMemory(60)).toBe(15);
    expect(cpu.getStatus()).toBe('HALTED');
  });

  it('handles MOV, memory indirect read, and JZ / JC', () => {
    const code = `
      LOAD A, 99
      MOV B, A
      STORE 10, B
      LOAD A, 0
      LOAD A, [10]
      HALT
    `;
    const { instructions } = Assembler.parse(code);
    cpu.loadProgram(instructions);
    cpu.runSync();

    expect(cpu.getRegister('A')).toBe(99);
    expect(cpu.getRegister('B')).toBe(99);
    expect(cpu.readMemory(10)).toBe(99);
  });

  it('prevents infinite loops with execution limit', () => {
    const code = `
      LOOP:
      JMP LOOP
    `;
    const { instructions } = Assembler.parse(code);
    cpu.loadProgram(instructions);
    const status = cpu.runSync(500);

    expect(status).toBe('ERROR');
    expect(cpu.getSnapshot().errorMessage).toContain('Execution limit exceeded');
  });

  it('validates single stepping executes step by step', () => {
    const code = `
      LOAD A, 1
      LOAD B, 2
      ADD A, B
      HALT
    `;
    const { instructions } = Assembler.parse(code);
    cpu.loadProgram(instructions);

    expect(cpu.getSnapshot().PC).toBe(0);
    expect(cpu.step()).toBe(true);
    expect(cpu.getRegister('A')).toBe(1);
    expect(cpu.getSnapshot().PC).toBe(1);

    expect(cpu.step()).toBe(true);
    expect(cpu.getRegister('B')).toBe(2);
    expect(cpu.getSnapshot().PC).toBe(2);

    expect(cpu.step()).toBe(true);
    expect(cpu.getRegister('A')).toBe(3);
    expect(cpu.getSnapshot().PC).toBe(3);

    // HALT
    expect(cpu.step()).toBe(false);
    expect(cpu.getStatus()).toBe('HALTED');
  });

  it('verifies reset restores clean initial state', () => {
    cpu.setRegister('A', 123);
    cpu.writeMemory(5, 77);
    cpu.reset();

    expect(cpu.getRegister('A')).toBe(0);
    expect(cpu.readMemory(5)).toBe(0);
    expect(cpu.getSnapshot().PC).toBe(0);
    expect(cpu.getStatus()).toBe('READY');
  });
});
