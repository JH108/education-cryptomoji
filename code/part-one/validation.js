'use strict';

const { createHash, randomBytes } = require('crypto');
const signing = require('./signing');
const blockchain = require('./blockchain')

/**
 * A simple validation function for transactions. Accepts a transaction
 * and returns true or false. It should reject transactions that:
 *   - have negative amounts
 *   - were improperly signed
 *   - have been modified since signing
 */
const isValidTransaction = transaction => {
  // Enter your solution here
  console.log()
  return transaction.amount >= 0 && signing.verify(transaction.source, `${transaction.source}${transaction.recipient}${transaction.amount}`, transaction.signature)
};

/**
 * Validation function for blocks. Accepts a block and returns true or false.
 * It should reject blocks if:
 *   - their hash or any other properties were altered
 *   - they contain any invalid transactions
 */
const isValidBlock = block => {
  // Your code here
  let validBlock = true
  const before = block.hash
  block.calculateHash(block.nonce)
  const after = block.hash
  // console.log('before hash', block.hash)
  // console.log('after hash', block.hash)
  // console.log('is valid hash', before === after);
  // console.log('block.calculateHash(block.nonce) !== block.hash', block.calculateHash(block.nonce) !== block.hash);
  if (before !== after) {
  	validBlock = false
  }

	block.transactions.forEach(transaction => {
		// console.log('is a valid transaction', isValidTransaction(transaction))
		// console.log('!isValidTransaction(transaction)', !isValidTransaction(transaction));
		if (!isValidTransaction(transaction)) {
			validBlock = false
		}
	})
	// console.log('is valid block', validBlock)
  return validBlock
};
const makeRandomTransaction = () => {
  const signer = signing.createPrivateKey();
  const recipient = signing.getPublicKey(signing.createPrivateKey());
  const amount = Math.ceil(Math.random() * 100);
  return new blockchain.Transaction(signer, recipient, amount);
};

const transactions = [ makeRandomTransaction() ];
const previousHash = randomBytes(64).toString('hex');
let block = new blockchain.Block(transactions, previousHash);
console.log('chain', block)
console.log(isValidBlock(block))
/**
 * One more validation function. Accepts a blockchain, and returns true
 * or false. It should reject any blockchain that:
 *   - is a missing genesis block
 *   - has any block besides genesis with a null hash
 *   - has any block besides genesis with a previousHash that does not match
 *     the previous hash
 *   - contains any invalid blocks
 *   - contains any invalid transactions
 */
const isValidChain = blockchain => {
  // Your code here

};

/**
 * This last one is just for fun. Become a hacker and tamper with the passed in
 * blockchain, mutating it for your own nefarious purposes. This should
 * (in theory) make the blockchain fail later validation checks;
 */
const breakChain = blockchain => {
  // Your code here

};

module.exports = {
  isValidTransaction,
  isValidBlock,
  isValidChain,
  breakChain
};
