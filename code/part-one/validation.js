'use strict';

const { createHash, randomBytes } = require('crypto');
const signing = require('./signing');
const blockchain = require('./blockchain')
const sha512 = (str) => createHash('sha512').update(str).digest('hex')

/**
 * A simple validation function for transactions. Accepts a transaction
 * and returns true or false. It should reject transactions that:
 *   - have negative amounts
 *   - were improperly signed
 *   - have been modified since signing
 */
const isValidTransaction = transaction => {
  // Enter your solution here
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
  block.calculateHash = function(nonce) {
    this.hash = sha512(`${this.transactions}${this.previousHash}${nonce}`)
    this.nonce = nonce
  }
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
		if (!isValidTransaction(transaction)) {
			validBlock = false
		}
	})
	// console.log('is valid block', validBlock)
  return validBlock
};

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
  let isValid = true
  const blocks = blockchain.blocks
  if (blocks[0].previousHash || blocks[0].transactions.length) {
    isValid = false
  }

  blocks.forEach((block, index) => {
    if ((!block.hash && index !== 0) || (!block.previousHash && index !== 0)) {
      isValid = false
    } else if (blocks[index - 1] && block.previousHash !== blocks[index - 1].hash) {
      isValid = false
    }
  })

  blocks.forEach((block, index) => {
    if (!isValidBlock(block) && index !== 0) {
      isValid = false
    }
  })

  return isValid
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
