import * as crypto from "crypto"
import * as bigintConversion from "bigint-conversion"

const serializeWitness = (witness) => {
  const serialized = {
    ...witness,
    root: witness.root.toString(),
    leaf: witness.root.toString(),
    pathElements: witness.pathElements.map((pathElement) =>
      pathElement.map((bigInt) => bigInt.toString())
    ),
  };
  return serialized;
};

const deserializeWitness = (witness) => {
  // deserialize witness
  const pathElements: [[]] = witness.pathElements;
  witness.pathElements = pathElements.map((pathElement) =>
    pathElement.map((num) => BigInt(num))
  );
  return witness;
};

const getHostFromUrl = (url: string) => {
  return new URL(url).host;
};

const getEpoch = (url: string) => {

  // The epoch is generated from the request url and a timestamp, determined in a known way for the client and the server
  //
  const timestamp = "1234";
  return `${url}--${timestamp}`
};


export { serializeWitness, deserializeWitness, getHostFromUrl, getEpoch };
