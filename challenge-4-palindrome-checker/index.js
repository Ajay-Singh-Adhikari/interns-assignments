#!/usr/bin/env node
'use strict';

/*
 * Challenge 4 - Palindrome Checker
 *
 * Usage:
 *   node index.js            (prompts for a string)
 *   node index.js "racecar"  (checks the argument directly)
 */

const readline = require('node:readline');
const { describe } = require('./palindrome');

function main() {
  const arg = process.argv.slice(2).join(' ');
  if (arg.trim()) {
    console.log(describe(arg));
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = () => {
    rl.question('Enter a string : ', (answer) => {
      if (!/[\p{L}\p{N}]/u.test(answer)) {
        console.log('Please enter a string with at least one letter or digit.');
        ask();
        return;
      }
      console.log(describe(answer));
      rl.close();
    });
  };
  ask();
}

main();
