'use strict';

const { createHash, randomBytes } = require('crypto');
const signing = require('./signing');

const sha512 = (str) => createHash('sha512').update(str).digest('hex')

/**
 * A simple signed Transaction class for sending funds from the signer to
 * another public key.
 */
class Transaction {
  /**
   * The constructor accepts a hex private key for the sender, a hex
   * public key for the recipient, and a number amount. It will use these
   * to set a number of properties, including a Secp256k1 signature.
   *
   * Properties:
   *   - source: the public key derived from the provided private key
   *   - recipient: the provided public key for the recipient
   *   - amount: the provided amount
   *   - signature: a unique signature generated from a combination of the
   *     other properties, signed with the provided private key
   */
  constructor(privateKey, recipient, amount) {
    const message = `${signing.getPublicKey(privateKey)}${recipient}${amount}`
    // Enter your solution here
    this.signature = signing.sign(privateKey, message)
    this.recipient = recipient
    this.amount = amount
    this.source = signing.getPublicKey(privateKey)
  }
}

/**
 * A Block class for storing an array of transactions and the hash of a
 * previous block. Includes a method to calculate and set its own hash.
 */
class Block {
  /**
   * Accepts an array of transactions and the hash of a previous block. It
   * saves these and uses them to calculate a hash.
   *
   * Properties:
   *   - transactions: the passed in transactions
   *   - previousHash: the passed in hash
   *   - nonce: just set this to some hard-coded number for now, it will be
   *     used later when we make blocks mineable with our own PoW algorithm
   *   - hash: a unique hash string generated from the other properties
   */
  constructor(transactions, previousHash) {
    // Your code here
    const nonce = Math.ceil(Math.random() * 100)
    this.transactions = transactions
    this.previousHash = previousHash
    this.hash = sha512(`${transactions}${previousHash}${nonce}`)
    this.nonce = nonce
  }

  /**
   * Accepts a nonce, and generates a unique hash for the block. Updates the
   * hash and nonce properties of the block accordingly.
   *
   * Hint:
   *   The format of the hash is up to you. Remember that it needs to be
   *   unique and deterministic, and must become invalid if any of the block's
   *   properties change.
   */
  calculateHash(nonce) {
    // Your code here
    this.hash = sha512(`${this.transactions}${this.previousHash}${nonce}`)
    this.nonce = nonce
  }
}
// const signer1 = signing.createPrivateKey();
// const recipient1 = signing.getPublicKey(signing.createPrivateKey());
// const amount1 = Math.ceil(Math.random() * 100);

// let transactions = [ new Transaction(signer1, recipient1, amount1) ];
// let previousHash = randomBytes(64).toString('hex');
// let block = new Block(transactions, previousHash);
// block.calculateHash(0);
// const originalHash = block.hash;

// const signer = signing.createPrivateKey();
// const recipient = signing.getPublicKey(signing.createPrivateKey());
// const amount = Math.ceil(Math.random() * 100);
// const newTransaction = new Transaction(signer, recipient, amount);
// block.transactions.push(newTransaction);

// block.calculateHash(0);
// console.log('block.hash !== originalHash', block.hash !== originalHash)

/**
 * A Blockchain class for storing an array of blocks, each of which is linked
 * to the previous block by their hashes. Includes methods for adding blocks,
 * fetching the head block, and checking the balances of public keys.
 */
class Blockchain {
  /**
   * Generates a new blockchain with a single "genesis" block. This is the
   * only block which may have no previous hash. It should have an empty
   * transactions array, and `null` for the previous hash.
   *
   * Properties:
   *   - blocks: an array of blocks, starting with one genesis block
   */
  constructor() {
    // Your code here
    this.blocks = [
      { transactions: [], previousHash: null, hash: sha512(signing.createPrivateKey())}
    ]
  }

  /**
   * Simply returns the last block added to the chain.
   */
  getHeadBlock() {
    // Your code here
    return this.blocks[this.blocks.length - 1]
  }

  /**
   * Accepts an array of transactions, creating a new block with them and
   * adding it to the chain.
   */
  addBlock(transactions) {
    // Your code here
    this.blocks.push(new Block(transactions, this.getHeadBlock().hash))
  }

  /**
   * Accepts a public key, calculating its "balance" based on the amounts
   * transferred in all transactions stored in the chain.
   *
   * Note:
   *   There is currently no way to create new funds on the chain, so some
   *   keys will have a negative balance. That's okay, we'll address it when
   *   we make the blockchain mineable later.
   */
  getBalance(publicKey) {
    // Your code here
    const received = this.blocks.reduce((acc, block) => acc + block.transactions.reduce((acc, transaction) => transaction.recipient === publicKey ? acc + transaction.amount : acc, 0), 0)
    const spent = this.blocks.reduce((acc, block) => acc + block.transactions.reduce((acc, transaction) => transaction.source === publicKey ? acc + transaction.amount : acc, 0), 0)

    return received - spent
  }
}
// let blockchain = new Blockchain()
// const signer = signing.createPrivateKey();
// const recipient = signing.getPublicKey(signing.createPrivateKey());
// const transaction = new Transaction(signer, recipient, 100);
// blockchain.addBlock([transaction]);

// console.log(blockchain.getBalance(recipient))
// console.log(blockchain.getBalance(signing.getPublicKey(signer)))

module.exports = {
  Transaction,
  Block,
  Blockchain
};
