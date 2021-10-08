import { poseidon } from "circomlib";

export default function poseidonHash(inputs: bigint[]): bigint {
  return poseidon(inputs);
}
