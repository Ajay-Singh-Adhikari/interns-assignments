#!/usr/bin/env node
'use strict';

/*
 * Challenge 2 - Evaluate Arithmetic Expressions
 *
 * Usage:
 *   node index.js [input.txt] [output.txt]
 *
 * Reads the input file line by line, solves each expression, and writes a
 * new file with each answer on the right-hand side of the "=".
 * Defaults: input.txt -> output.txt in this folder.
 */

const fs = require('node:fs');
const path = require('node:path');
const { solveLine } = require('./evaluator');

function main() {
  const [inArg, outArg] = process.argv.slice(2);
  const inputPath = path.resolve(inArg || path.join(__dirname, 'input.txt'));
  const outputPath = path.resolve(outArg || path.join(__dirname, 'output.txt'));

  if (inputPath === outputPath) {
    console.error('Error: the output file must differ from the input file.');
    process.exit(1);
  }

  let content;
  try {
    content = fs.readFileSync(inputPath, 'utf8');
  } catch (err) {
    console.error(`Error: cannot read ${inputPath}: ${err.message}`);
    process.exit(1);
  }

  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();

  const solved = lines.map(solveLine);
  fs.writeFileSync(outputPath, solved.join(eol) + eol, 'utf8');

  solved.forEach((line) => line.trim() && console.log(line));
  console.log(`\nAnswers written to ${outputPath}`);
}

main();
