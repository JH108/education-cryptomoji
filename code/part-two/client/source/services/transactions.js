import {
  Transaction,
  TransactionHeader,
  Batch,
  BatchHeader,
  BatchList
} from "sawtooth-sdk/protobuf";
import { createHash } from "crypto";
import { getPublicKey, sign } from "./signing.js";
import { encode } from "./encoding.js";

const FAMILY_NAME = "cryptomoji";
const FAMILY_VERSION = "0.1";
const NAMESPACE = "5f4d76";

export const makeNonce = () => Math.floor(Math.random() * 10000).toFixed();
/**
 * A function that takes a private key and a payload and returns a new
 * signed Transaction instance.
 *
 * Hint:
 *   Remember ProtobufJS has two different APIs for encoding protobufs
 *   (which you'll use for the TransactionHeader) and for creating
 *   protobuf instances (which you'll use for the Transaction itself):
 *     - TransactionHeader.encode({ ... }).finish()
 *     - Transaction.create({ ... })
 *
 *   Also, don't forget to encode your payload!
 * EXAMPLE HEADER: 
 * familyName: 'intkey',
    familyVersion: '1.0',
    inputs: ['1cf1266e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7'],
    outputs: ['1cf1266e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7'],
    signerPublicKey: signer.getPublicKey().asHex(),
    // In this example, we're signing the batch with the same private key,
    // but the batch can be signed by another party, in which case, the
    // public key will need to be associated with that key.
    batcherPublicKey: signer.getPublicKey().asHex(),
    // In this example, there are no dependencies.  This list should include
    // an previous transaction header signatures that must be applied for
    // this transaction to successfully commit.
    // For example,
    // dependencies: ['540a6803971d1880ec73a96cb97815a95d374cbad5d865925e5aa0432fcf1931539afe10310c122c5eaae15df61236079abbf4f258889359c4d175516934484a'],
    dependencies: [],
    payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
 */
// Initially doesn't have any inputs or outputs or dependencies because it isn't accessing anything on the chain
/**
 * Inputs = transaction is allow to read from
 * Outputs = transaction is allow to write too
 * Dependencies = places on the chain this transaction is dependant on
 */
export const createTransaction = (privateKey, payload) => {
  const encodedPayload = encode(payload);
  const payloadHash = createHash("sha512");
  payloadHash.update(encodedPayload);
  const digestedPayload = payloadHash.digest("hex");
  const publicKey = getPublicKey(privateKey);
  const header = TransactionHeader.encode({
    familyName: FAMILY_NAME,
    familyVersion: FAMILY_VERSION,
    signerPublicKey: publicKey,
    batcherPublicKey: publicKey,
    inputs: [NAMESPACE],
    outputs: [NAMESPACE],
    dependencies: [],
    payloadSha512: digestedPayload,
    nonce: makeNonce()
  }).finish();
  const signedHeader = sign(privateKey, header);
  const transaction = Transaction.create({
    header,
    payload: encodedPayload,
    headerSignature: signedHeader
  });

  return transaction;
};

/**
 * A function that takes a private key and one or more Transaction instances
 * and returns a signed Batch instance.
 *
 * Should accept both multiple transactions in an array, or just one
 * transaction with no array.
 */
export const createBatch = (privateKey, transactions) => {
  let transactionArray = Array.from(transactions);
  if (transactionArray.length === 0) {
    transactionArray.push(transactions);
  }
  const transactionIds = transactionArray.map(
    transaction => transaction.headerSignature
  );
  const signerPublicKey = getPublicKey(privateKey);
  const header = BatchHeader.encode({
    signerPublicKey,
    transactionIds
  }).finish();
  const headerSignature = sign(privateKey, header);
  const batch = Batch.create({
    header,
    headerSignature,
    transactions: transactionArray
  });

  return batch;
};

/**
 * A fairly simple function that takes a one or more Batch instances and
 * returns an encoded BatchList.
 *
 * Although there isn't much to it, axios has a bug when POSTing the generated
 * Buffer. We've implemented it for you, transforming the Buffer so axios
 * can handle it.
 */
export const encodeBatches = batches => {
  if (!Array.isArray(batches)) {
    batches = [batches];
  }
  const batchList = BatchList.encode({ batches }).finish();

  // Axios will mishandle a Uint8Array constructed with a large ArrayBuffer.
  // The easiest workaround is to take a slice of the array.
  return batchList.slice();
};

/**
 * A convenince function that takes a private key and one or more payloads and
 * returns an encoded BatchList for submission. Each payload should be wrapped
 * in a Transaction, which will be wrapped together in a Batch, and then
 * finally wrapped in a BatchList.
 *
 * As with the other methods, it should handle both a single payload, or
 * multiple payloads in an array.
 */
// Could modify this to be more performant by maxing out on the payloads it allows per batch
export const encodeAll = (privateKey, payloads) => {
  if (!Array.isArray(payloads)) {
    payloads = [payloads];
  }
  const transactions = payloads.map(payload =>
    createTransaction(privateKey, payload)
  );
  const batch = createBatch(privateKey, transactions);
  const encodedBatch = encodeBatches([batch]);

  return encodedBatch;
};
