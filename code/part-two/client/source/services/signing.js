import * as secp256k1 from "secp256k1";
import { randomBytes, createHash } from "crypto";

export const makeHash = () => createHash("sha256");
export const makeBuffer = hex => Buffer.from(hex, "hex");

/**
 * This module is essentially identical to part-one's signing module.
 * Feel free to copy in your solution from there.
 *
 * This function generates a random Secp256k1 private key, returning it as
 * a 64 character hex string.
 */
export const createPrivateKey = () => {
  const hash = makeHash();
  hash.update(randomBytes(64));

  return hash.digest("hex");
};

/**
 * Takes a hexadecimal private key and returns its public pair as a
 * 66 character hexadecimal string.
 */
export const getPublicKey = privateKey => {
  const buffer = makeBuffer(privateKey);
  const pubKeyBuffer = secp256k1.publicKeyCreate(buffer);

  return pubKeyBuffer.toString("hex");
};

/**
 * This convenience function did not exist in part-one's signing module, but
 * should be simple to implement. It creates both private and public keys,
 * returning them in an object with two properties:
 *   - privateKey: the hex private key
 *   - publicKey: the matching hex public key
 *
 * Example:
 *   const keys = createKeys();
 *   console.log(keys);
 *   // {
 *   //   privateKey: 'e291df3eede7f0c520fddbe5e9e53434ff7ef3c0894ed9d9cbc...',
 *   //   publicKey: '0202694593ddc71061e622222ed400f5373cfa7ea607ce106cca...'
 *   // }
 */
export const createKeys = () => {
  const userKeys = {};

  userKeys.privateKey = createPrivateKey();
  userKeys.publicKey = getPublicKey(userKeys.privateKey);

  return userKeys;
};

/**
 * Takes a hex private key and a string message, returning a
 * hexadecimal signature.
 */
export const sign = (privateKey, message) => {
  const hash = makeHash();
  hash.update(message);
  const hashedMessageBuffer = hash.digest();
  const privateKeyBuffer = makeBuffer(privateKey);
  const signatureObject = secp256k1.sign(hashedMessageBuffer, privateKeyBuffer);
  const signature = signatureObject.signature.toString("hex");

  return signature;
};
