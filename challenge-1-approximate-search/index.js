#!/usr/bin/env node
'use strict';

/*
 * Challenge 1 - Approximate Search
 *
 * Usage:
 *   node index.js [path/to/words.txt] [--k 5]
 *
 * Loads the words from the text file into memory, then waits for input.
 * Type a word and press Enter to get the closest suggestions.
 * Type "exit" or press Ctrl+D to quit.
 */

const path = require('node:path');
const readline = require('node:readline');
const { loadWords, approximateSearch } = require('./search');

function parseArgs(argv) {
  const options = { file: path.join(__dirname, 'words.txt'), k: 5 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--k' || arg === '-k') {
      const k = Number.parseInt(argv[++i], 10);
      if (!Number.isInteger(k) || k < 1) {
        throw new Error('--k must be a positive integer');
      }
      options.k = k;
    } else {
      options.file = path.resolve(arg);
    }
  }
  return options;
}

function main() {
  let options;
  let words;
  try {
    options = parseArgs(process.argv.slice(2));
    words = loadWords(options.file);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  if (words.length === 0) {
    console.error(`Error: no words found in ${options.file}`);
    process.exit(1);
  }

  console.log(
    `Loaded ${words.length} words from ${path.basename(options.file)}. ` +
      `Showing up to ${options.k} suggestions. Type "exit" to quit.`,
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Input >> ',
  });

  rl.prompt();
  rl.on('line', (line) => {
    const query = line.trim();
    if (query.toLowerCase() === 'exit') {
      rl.close();
      return;
    }
    if (query) {
      const results = approximateSearch(words, query, options.k);
      console.log(
        `Output >> ${results.length ? results.join(', ') : 'No similar words found.'}`,
      );
    }
    rl.prompt();
  });
  rl.on('close', () => process.exit(0));
}

main();
