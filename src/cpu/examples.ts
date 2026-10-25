export interface ExampleProgram {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
  expectedResult: string;
}

export const EXAMPLE_PROGRAMS: ExampleProgram[] = [
  {
    id: 'example-1-addition',
    name: 'Example 1: Addition',
    category: 'Arithmetic',
    description: 'Computes 10 + 20 and stores 30 into memory address 50.',
    code: `; Addition example
LOAD A, 10
LOAD B, 20
ADD A, B
STORE 50, A
HALT`,
    expectedResult: 'Register A = 30, Register B = 20, Memory[50] = 30, Status = HALTED',
  },
  {
    id: 'example-2-subtraction',
    name: 'Example 2: Subtraction',
    category: 'Arithmetic',
    description: 'Computes 50 - 20 and stores 30 into memory address 51.',
    code: `; Subtraction example
LOAD A, 50
LOAD B, 20
SUB A, B
STORE 51, A
HALT`,
    expectedResult: 'Register A = 30, Register B = 20, Memory[51] = 30, Status = HALTED',
  },
  {
    id: 'example-3-logical-and',
    name: 'Example 3: Logical AND',
    category: 'Logical',
    description: 'Performs 12 AND 10 (binary 1100 & 1010 = 1000 = 8) and stores in Memory[52].',
    code: `; Logical AND example
LOAD A, 12
LOAD B, 10
AND A, B
STORE 52, A
HALT`,
    expectedResult: 'Register A = 8, Register B = 10, Memory[52] = 8, Status = HALTED',
  },
  {
    id: 'example-4-increment',
    name: 'Example 4: Increment',
    category: 'Arithmetic',
    description: 'Loads 15 into A, increments to 16, and stores into Memory[53].',
    code: `; Increment example
LOAD A, 15
INC A
STORE 53, A
HALT`,
    expectedResult: 'Register A = 16, Memory[53] = 16, Status = HALTED',
  },
  {
    id: 'example-5-conditional-jump',
    name: 'Example 5: Conditional Jump (Count Down Loop)',
    category: 'Control Flow',
    description: 'Calculates the sum 5+4+3+2+1 = 15 by looping with DEC and JNZ.',
    code: `; Conditional Jump Loop: Sum numbers 5 down to 1
; Reg A = accumulator sum (starts at 0)
; Reg B = counter (starts at 5)
LOAD A, 0
LOAD B, 5

LOOP:
ADD A, B
DEC B
; If B != 0 (Z flag is 0), continue looping
JNZ LOOP

; Store final sum (15) into memory address 60
STORE 60, A
HALT`,
    expectedResult: 'Register A = 15, Register B = 0, Memory[60] = 15, Status = HALTED',
  },
  {
    id: 'example-6-boundary-overflow',
    name: 'Example 6: Boundary & Overflow Flag Demo',
    category: 'Boundary Cases',
    description: 'Demonstrates 127 + 1 = 128 producing Signed Overflow (V=1) and Carry boundaries.',
    code: `; Boundary: Signed Overflow Test
; 127 + 1 = 128 (Signed: +127 + 1 = -128, sets V flag)
LOAD A, 127
LOAD B, 1
ADD A, B
STORE 70, A

; Boundary: Unsigned 255 + 1 = 0 with Carry Flag
LOAD A, 255
LOAD B, 1
ADD A, B
STORE 71, A
HALT`,
    expectedResult: 'Memory[70]=128 (V=1, S=1), Memory[71]=0 (Z=1, C=1)',
  },
  {
    id: 'example-7-memory-indirect',
    name: 'Example 7: Memory Read & Write',
    category: 'Memory',
    description: 'Stores a value to memory, loads it back to another register, and increments.',
    code: `; Memory indirect load and store
LOAD A, 42
STORE 100, A
LOAD B, [100]
INC B
STORE 101, B
HALT`,
    expectedResult: 'Memory[100]=42, Memory[101]=43, Reg B=43',
  },
];
