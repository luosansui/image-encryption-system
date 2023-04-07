declare class MersenneTwister {
  constructor(seed?: number);
  init_genrand(s: number): void;
  init_by_array(init_key: number[], key_length: number): void;
  genrand_int32(): number;
}
export default MersenneTwister;
