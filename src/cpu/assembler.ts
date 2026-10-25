import { ParsedInstruction, AssemblyError } from './types';

/**
 * Parser and assembler for the 8-bit CPU.
 * Supports labels (e.g., LOOP:), comments (; comment),
 * and all 8-bit ISA instructions.
 */
export class Assembler {
  public static parse(sourceCode: string): {
    instructions: ParsedInstruction[];
    errors: AssemblyError[];
    labelMap: Record<string, number>;
  } {
    const lines = sourceCode.split('\n');
    const instructions: ParsedInstruction[] = [];
    const errors: AssemblyError[] = [];
    const labelMap: Record<string, number> = {};

    interface RawLine {
      lineIndex: number; // 0-based
      rawText: string;
      cleanCode: string;
    }

    const rawLines: RawLine[] = [];

    // Pass 1: Strip comments, find labels, and count sequential instruction addresses
    let currentAddress = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // strip comment
      const commentIdx = line.indexOf(';');
      let code = commentIdx >= 0 ? line.substring(0, commentIdx) : line;
      code = code.trim();

      if (!code) {
        continue;
      }

      // Check for labels (e.g. `LOOP:` or `START: LOAD A, 10`)
      let remainingCode = code;
      const labelMatch = remainingCode.match(/^([a-zA-Z_][a-zA-Z0-9_]*):(.*)$/);
      if (labelMatch) {
        const labelName = labelMatch[1].toUpperCase();
        if (labelMap[labelName] !== undefined) {
          errors.push({
            line: i + 1,
            message: `Duplicate label definition: '${labelName}'`,
          });
        }
        labelMap[labelName] = currentAddress;
        remainingCode = labelMatch[2].trim();
      }

      if (remainingCode.length > 0) {
        rawLines.push({
          lineIndex: i,
          rawText: line,
          cleanCode: remainingCode,
        });
        currentAddress++;
      }
    }

    // Pass 2: Parse instructions, validate opcodes & operands
    for (let addr = 0; addr < rawLines.length; addr++) {
      const { lineIndex, rawText, cleanCode } = rawLines[addr];
      const lineNum = lineIndex + 1;

      // Split opcode and arguments: e.g. "LOAD A, 10" or "INC A" or "HALT"
      const firstSpace = cleanCode.search(/\s/);
      let opcode = '';
      let argsString = '';

      if (firstSpace === -1) {
        opcode = cleanCode.toUpperCase();
      } else {
        opcode = cleanCode.substring(0, firstSpace).toUpperCase();
        argsString = cleanCode.substring(firstSpace).trim();
      }

      // Split arguments by comma
      const rawArgs = argsString.length > 0 
        ? argsString.split(',').map((a) => a.trim()) 
        : [];

      const parsed: ParsedInstruction = {
        lineIndex,
        address: addr,
        rawText,
        opcode,
        arg1: rawArgs[0],
        arg2: rawArgs[1],
      };

      // Validate instruction set
      switch (opcode) {
        // Data Transfer
        case 'LOAD': {
          if (rawArgs.length !== 2) {
            errors.push({ line: lineNum, message: "LOAD requires 2 arguments: LOAD <reg>, <val|[addr]>" });
            break;
          }
          const reg = rawArgs[0].toUpperCase();
          if (reg !== 'A' && reg !== 'B') {
            errors.push({ line: lineNum, message: `Invalid destination register '${rawArgs[0]}'. Must be A or B.` });
            break;
          }

          const op2 = rawArgs[1];
          // Check if indirect/bracketed: [address]
          const bracketMatch = op2.match(/^\[(.*)\]$/);
          if (bracketMatch) {
            const inner = bracketMatch[1].trim();
            const addrVal = Assembler.parseNumberOrLabel(inner, labelMap);
            if (addrVal === null || addrVal < 0 || addrVal > 255) {
              errors.push({ line: lineNum, message: `Memory address '${inner}' in [address] must be between 0 and 255.` });
            } else {
              parsed.parsedArg1 = { type: 'REGISTER', value: reg };
              parsed.parsedArg2 = { type: 'INDIRECT', value: addrVal };
            }
          } else {
            // Immediate value or constant
            const immVal = Assembler.parseNumberOrLabel(op2, labelMap);
            if (immVal === null || immVal < 0 || immVal > 255) {
              errors.push({ line: lineNum, message: `Immediate value '${op2}' must be a valid 8-bit integer (0 to 255).` });
            } else {
              parsed.parsedArg1 = { type: 'REGISTER', value: reg };
              parsed.parsedArg2 = { type: 'IMMEDIATE', value: immVal };
            }
          }
          break;
        }

        case 'MOV': {
          if (rawArgs.length !== 2) {
            errors.push({ line: lineNum, message: "MOV requires 2 arguments: MOV <dest>, <src>" });
            break;
          }
          const dest = rawArgs[0].toUpperCase();
          const src = rawArgs[1].toUpperCase();
          if ((dest === 'A' && src === 'B') || (dest === 'B' && src === 'A')) {
            parsed.parsedArg1 = { type: 'REGISTER', value: dest };
            parsed.parsedArg2 = { type: 'REGISTER', value: src };
          } else {
            errors.push({ line: lineNum, message: `Invalid MOV operation: '${dest}, ${src}'. Supported: 'MOV A, B' or 'MOV B, A'.` });
          }
          break;
        }

        case 'STORE': {
          if (rawArgs.length !== 2) {
            errors.push({ line: lineNum, message: "STORE requires 2 arguments: STORE <address>, <reg>" });
            break;
          }
          const addrVal = Assembler.parseNumberOrLabel(rawArgs[0], labelMap);
          const srcReg = rawArgs[1].toUpperCase();

          if (addrVal === null || addrVal < 0 || addrVal > 255) {
            errors.push({ line: lineNum, message: `Memory address '${rawArgs[0]}' must be between 0 and 255.` });
            break;
          }
          if (srcReg !== 'A' && srcReg !== 'B') {
            errors.push({ line: lineNum, message: `Invalid source register '${rawArgs[1]}'. Must be A or B.` });
            break;
          }
          parsed.parsedArg1 = { type: 'DIRECT', value: addrVal };
          parsed.parsedArg2 = { type: 'REGISTER', value: srcReg };
          break;
        }

        // Arithmetic
        case 'ADD':
        case 'SUB': {
          if (rawArgs.length !== 2) {
            errors.push({ line: lineNum, message: `${opcode} requires 2 register arguments (e.g., ${opcode} A, B)` });
            break;
          }
          const r1 = rawArgs[0].toUpperCase();
          const r2 = rawArgs[1].toUpperCase();
          if (r1 !== 'A' || r2 !== 'B') {
            errors.push({ line: lineNum, message: `${opcode} only supports accumulator operation '${opcode} A, B'` });
            break;
          }
          parsed.parsedArg1 = { type: 'REGISTER', value: r1 };
          parsed.parsedArg2 = { type: 'REGISTER', value: r2 };
          break;
        }

        case 'INC':
        case 'DEC': {
          if (rawArgs.length !== 1) {
            errors.push({ line: lineNum, message: `${opcode} requires 1 register argument: ${opcode} A or ${opcode} B` });
            break;
          }
          const r = rawArgs[0].toUpperCase();
          if (r !== 'A' && r !== 'B') {
            errors.push({ line: lineNum, message: `Invalid register '${rawArgs[0]}'. Must be A or B.` });
            break;
          }
          parsed.parsedArg1 = { type: 'REGISTER', value: r };
          break;
        }

        // Logical
        case 'AND':
        case 'OR':
        case 'XOR': {
          if (rawArgs.length !== 2) {
            errors.push({ line: lineNum, message: `${opcode} requires 2 arguments (e.g. ${opcode} A, B or ${opcode} B, A)` });
            break;
          }
          const r1 = rawArgs[0].toUpperCase();
          const r2 = rawArgs[1].toUpperCase();
          if ((r1 === 'A' && r2 === 'B') || (r1 === 'B' && r2 === 'A')) {
            parsed.parsedArg1 = { type: 'REGISTER', value: r1 };
            parsed.parsedArg2 = { type: 'REGISTER', value: r2 };
          } else {
            errors.push({ line: lineNum, message: `Invalid operands for ${opcode}. Supported: '${opcode} A, B' or '${opcode} B, A'.` });
          }
          break;
        }

        case 'NOT': {
          if (rawArgs.length !== 1) {
            errors.push({ line: lineNum, message: `NOT requires 1 register argument: NOT A or NOT B` });
            break;
          }
          const r = rawArgs[0].toUpperCase();
          if (r !== 'A' && r !== 'B') {
            errors.push({ line: lineNum, message: `Invalid register '${rawArgs[0]}'. Must be A or B.` });
            break;
          }
          parsed.parsedArg1 = { type: 'REGISTER', value: r };
          break;
        }

        // Control flow
        case 'JMP':
        case 'JZ':
        case 'JNZ':
        case 'JC': {
          if (rawArgs.length !== 1) {
            errors.push({ line: lineNum, message: `${opcode} requires 1 target address or label (e.g., ${opcode} 5)` });
            break;
          }
          const target = Assembler.parseNumberOrLabel(rawArgs[0], labelMap);
          if (target === null || target < 0) {
            errors.push({ line: lineNum, message: `Invalid jump target '${rawArgs[0]}'. Must be valid instruction address (>=0) or existing label.` });
          } else {
            parsed.parsedArg1 = { type: 'DIRECT', value: target };
          }
          break;
        }

        case 'HALT': {
          if (rawArgs.length > 0) {
            errors.push({ line: lineNum, message: `HALT takes no arguments.` });
          }
          break;
        }

        default:
          errors.push({ line: lineNum, message: `Unknown instruction or opcode: '${opcode}'` });
      }

      instructions.push(parsed);
    }

    return { instructions, errors, labelMap };
  }

  /**
   * Helper to parse a decimal, hex (0x..), binary (0b..), or label target
   */
  public static parseNumberOrLabel(str: string, labelMap: Record<string, number>): number | null {
    const s = str.trim();
    if (labelMap[s.toUpperCase()] !== undefined) {
      return labelMap[s.toUpperCase()];
    }

    // Hexadecimal
    if (/^0x[0-9a-fA-F]+$/i.test(s)) {
      return parseInt(s, 16);
    }

    // Binary
    if (/^0b[01]+$/i.test(s)) {
      return parseInt(s.substring(2), 2);
    }

    // Decimal
    if (/^-?\d+$/.test(s)) {
      return parseInt(s, 10);
    }

    return null;
  }
}
