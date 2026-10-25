import { CPUFlags } from './types';

/**
 * Format helper utilities for 8-bit values
 */
export function toHex8(value: number): string {
  const v = (value & 0xff).toString(16).toUpperCase();
  return '0x' + (v.length === 1 ? '0' + v : v);
}

export function toBin8(value: number): string {
  const v = (value & 0xff).toString(2);
  return '0b' + v.padStart(8, '0');
}

export function toSigned8(value: number): number {
  const v = value & 0xff;
  return v > 127 ? v - 256 : v;
}

export interface ALUResult {
  value: number; // 8-bit clamped (0 - 255)
  flags: CPUFlags;
}

/**
 * 8-bit Arithmetic Logic Unit
 * Calculates actual outputs and CPU status flags:
 * Z (Zero): result === 0
 * C (Carry): unsigned carry/borrow
 * S (Sign): bit 7 === 1
 * V (Overflow): signed 8-bit overflow (-128 to 127)
 */
export class ALU {
  /**
   * ADD: op1 + op2
   */
  public static add(op1: number, op2: number): ALUResult {
    const a = op1 & 0xff;
    const b = op2 & 0xff;
    const raw = a + b;
    const result = raw & 0xff;

    // Carry: unsigned sum exceeded 255
    const C = raw > 0xff;

    // Zero: 8-bit result is 0
    const Z = result === 0;

    // Sign: bit 7 is set
    const S = (result & 0x80) !== 0;

    // Overflow (signed overflow):
    // Occurs when adding two operands of the same sign produces a result with a different sign.
    // In boolean logic: ((a ^ result) & (b ^ result) & 0x80) !== 0
    const V = (((a ^ result) & (b ^ result) & 0x80) !== 0);

    return {
      value: result,
      flags: { Z, C, S, V },
    };
  }

  /**
   * SUB: op1 - op2
   * Standard convention: Carry is set when borrow occurs (i.e. op1 < op2 unsigned).
   */
  public static sub(op1: number, op2: number): ALUResult {
    const a = op1 & 0xff;
    const b = op2 & 0xff;
    const raw = a - b;
    const result = (raw + 256) & 0xff;

    // Carry flag: Borrow occurred in unsigned subtraction (op1 < op2)
    const C = a < b;

    // Zero
    const Z = result === 0;

    // Sign
    const S = (result & 0x80) !== 0;

    // Overflow (signed overflow):
    // Occurs when subtracting numbers of different signs produces an incorrect sign.
    // ((a ^ b) & (a ^ result) & 0x80) !== 0
    const V = (((a ^ b) & (a ^ result) & 0x80) !== 0);

    return {
      value: result,
      flags: { Z, C, S, V },
    };
  }

  /**
   * INC: op + 1
   */
  public static inc(op: number): ALUResult {
    return ALU.add(op, 1);
  }

  /**
   * DEC: op - 1
   */
  public static dec(op: number): ALUResult {
    return ALU.sub(op, 1);
  }

  /**
   * AND: op1 & op2
   */
  public static and(op1: number, op2: number): ALUResult {
    const result = (op1 & op2) & 0xff;
    return {
      value: result,
      flags: {
        Z: result === 0,
        C: false,
        S: (result & 0x80) !== 0,
        V: false,
      },
    };
  }

  /**
   * OR: op1 | op2
   */
  public static or(op1: number, op2: number): ALUResult {
    const result = (op1 | op2) & 0xff;
    return {
      value: result,
      flags: {
        Z: result === 0,
        C: false,
        S: (result & 0x80) !== 0,
        V: false,
      },
    };
  }

  /**
   * XOR: op1 ^ op2
   */
  public static xor(op1: number, op2: number): ALUResult {
    const result = (op1 ^ op2) & 0xff;
    return {
      value: result,
      flags: {
        Z: result === 0,
        C: false,
        S: (result & 0x80) !== 0,
        V: false,
      },
    };
  }

  /**
   * NOT: ~op
   */
  public static not(op: number): ALUResult {
    const result = (~op) & 0xff;
    return {
      value: result,
      flags: {
        Z: result === 0,
        C: false,
        S: (result & 0x80) !== 0,
        V: false,
      },
    };
  }
}
