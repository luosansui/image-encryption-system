export enum DNACodeEnum {
  A = "A",
  T = "T",
  C = "C",
  G = "G",
}
export enum RuleEnum {
  rule1 = 0,
  rule2 = 1,
  rule3 = 2,
  rule4 = 3,
  rule5 = 4,
  rule6 = 5,
  rule7 = 6,
  rule8 = 7,
}
export enum Bit2Enum {
  bit0 = 0b00,
  bit1 = 0b01,
  bit2 = 0b10,
  bit3 = 0b11,
}
export type DNAByte = [DNACodeEnum, DNACodeEnum, DNACodeEnum, DNACodeEnum];
export type Bit2Byte = [Bit2Enum, Bit2Enum, Bit2Enum, Bit2Enum];
//常量
const MAP_DNAENCODE: {
  [key: number]: { [key: number]: DNACodeEnum[keyof DNACodeEnum] };
} = {
  0: { 0: "A", 1: "C", 2: "G", 3: "T" },
  1: { 0: "A", 1: "G", 2: "C", 3: "T" },
  2: { 0: "C", 1: "A", 2: "T", 3: "G" },
  3: { 0: "C", 1: "T", 2: "A", 3: "G" },
  4: { 0: "G", 1: "A", 2: "T", 3: "C" },
  5: { 0: "G", 1: "T", 2: "A", 3: "C" },
  6: { 0: "T", 1: "C", 2: "G", 3: "A" },
  7: { 0: "T", 1: "G", 2: "C", 3: "A" },
};
const MAP_DNADECODE: { [key: number]: { [key: string]: Bit2Enum } } = {
  0: { A: 0, C: 1, G: 2, T: 3 },
  1: { A: 0, G: 1, C: 2, T: 3 },
  2: { C: 0, A: 1, T: 2, G: 3 },
  3: { C: 0, T: 1, A: 2, G: 3 },
  4: { G: 0, A: 1, T: 2, C: 3 },
  5: { G: 0, T: 1, A: 2, C: 3 },
  6: { T: 0, C: 1, G: 2, A: 3 },
  7: { T: 0, G: 1, C: 2, A: 3 },
};
const TABLE_ADD4RULE_1: {
  [key: string]: { [key: string]: DNACodeEnum[keyof DNACodeEnum] };
} = {
  A: { A: "A", T: "T", C: "C", G: "G" },
  T: { A: "T", T: "G", C: "A", G: "C" },
  C: { A: "C", T: "A", C: "G", G: "T" },
  G: { A: "G", T: "C", C: "T", G: "A" },
};
const TABLE_SUB4RULE_1: {
  [key: string]: { [key: string]: DNACodeEnum[keyof DNACodeEnum] };
} = {
  A: { A: "A", T: "C", C: "T", G: "G" },
  T: { A: "T", T: "A", C: "G", G: "C" },
  C: { A: "C", T: "G", C: "A", G: "T" },
  G: { A: "G", T: "T", C: "C", G: "A" },
};
const TABLE_XOR4RULE_1: {
  [key: string]: { [key: string]: DNACodeEnum[keyof DNACodeEnum] };
} = {
  A: { A: "A", T: "T", C: "C", G: "G" },
  T: { A: "T", T: "A", C: "G", G: "C" },
  C: { A: "C", T: "G", C: "A", G: "T" },
  G: { A: "G", T: "C", C: "T", G: "A" },
};
const TABLE_XNOR4RULE_1: {
  [key: string]: { [key: string]: DNACodeEnum[keyof DNACodeEnum] };
} = {
  A: { A: "T", T: "A", C: "G", G: "C" },
  T: { A: "A", T: "T", C: "C", G: "G" },
  C: { A: "G", T: "C", C: "T", G: "A" },
  G: { A: "C", T: "G", C: "A", G: "T" },
};
/**
 * 将字节转为DNA编码
 * @param byte 输入的字节
 * @param rule 编码规则
 */
export const byte2DNAByte = (byte: number, rule: RuleEnum) => {
  return [
    dnaEncode((byte >> 6) & 0b00000011, rule),
    dnaEncode((byte >> 4) & 0b00000011, rule),
    dnaEncode((byte >> 2) & 0b00000011, rule),
    dnaEncode((byte >> 0) & 0b00000011, rule),
  ] as DNAByte;
};
/**
 * 将DNA编码转为字节
 * @param code 输入的DNA编码
 * @param rule 解码规则
 */
export const dnaByte2Byte = (code: DNAByte, rule: RuleEnum) => {
  return (
    (dnaDecode(code[0], rule) << 6) |
    (dnaDecode(code[1], rule) << 4) |
    (dnaDecode(code[2], rule) << 2) |
    (dnaDecode(code[3], rule) << 0)
  );
};
/**
 * DNA编码
 * @param num 输入的数值
 * @param rule 编码规则
 * @returns 编码后的核苷酸
 */
export const dnaEncode = (num: Bit2Enum, rule: number) => {
  return MAP_DNAENCODE[rule][num];
};
/**
 * DNA解码
 * @param base 输入的碱基
 * @param rule 解码规则
 * @returns 解码后的数值
 */
export const dnaDecode = (base: DNACodeEnum, rule: number) => {
  return MAP_DNADECODE[rule][base];
};
/**
 * 规则1对应的加法运算
 * @param row 输入的碱基
 * @param col 输入的碱基
 * @returns 运算后的碱基
 */
export const add4Rule1 = (row: DNACodeEnum, col: DNACodeEnum) => {
  return TABLE_ADD4RULE_1[row][col];
};
/**
 * 规则1对应的减法运算
 * @param row 输入的碱基
 * @param col 输入的碱基
 * @returns 运算后的碱基
 */
export const sub4Rule1 = (row: DNACodeEnum, col: DNACodeEnum) => {
  return TABLE_SUB4RULE_1[row][col];
};
/**
 * 规则1对应的异或运算
 * @param row 输入的碱基
 * @param col 输入的碱基
 * @returns 运算后的碱基
 */
export const xor4Rule1 = (row: DNACodeEnum, col: DNACodeEnum) => {
  return TABLE_XOR4RULE_1[row][col];
};
/**
 * XNOR运算
 * @param row 输入的碱基1
 * @param col 输入的碱基2
 * @returns 运算后的碱基
 */
export const xnor4Rule1 = (row: DNACodeEnum, col: DNACodeEnum) => {
  return TABLE_XNOR4RULE_1[row][col];
};
