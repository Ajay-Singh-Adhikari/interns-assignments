'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { loadWords, approximateSearch } = require('../challenge-1-approximate-search/search');
const { evaluate, solveLine } = require('../challenge-2-arithmetic-expressions/evaluator');
const { buildMessage, validateImage, SUBJECT } = require('../challenge-3-send-email/mail');
const { isPalindrome, describe } = require('../challenge-4-palindrome-checker/palindrome');

test('challenge 1: approximate search', async (t) => {
  const words = loadWords(path.join(__dirname, '../challenge-1-approximate-search/words.txt'));

  await t.test('example 1: abslutly -> absolutely', () => {
    assert.equal(approximateSearch(words, 'abslutly', 1)[0], 'absolutely');
  });

  await t.test('example 2: actv -> active, activity ...', () => {
    const results = approximateSearch(words, 'actv', 5);
    assert.equal(results[0], 'active');
    assert.ok(results.includes('activity'));
  });

  await t.test('handles transpositions and ignores case', () => {
    assert.equal(approximateSearch(words, 'TEH', 1)[0], 'the');
    assert.equal(approximateSearch(words, 'recieve', 1)[0], 'receive');
  });

  await t.test('respects k and returns nothing for gibberish', () => {
    assert.equal(approximateSearch(words, 'word', 3).length, 3);
    assert.deepEqual(approximateSearch(words, 'xqzjvk', 5), []);
    assert.deepEqual(approximateSearch(words, '   ', 5), []);
  });

  await t.test('parses any text file', () => {
    const file = path.join(os.tmpdir(), `words-${process.pid}.txt`);
    fs.writeFileSync(file, 'Hello, world! Hello again; help me.');
    try {
      assert.deepEqual(loadWords(file), ['hello', 'world', 'again', 'help', 'me']);
    } finally {
      fs.unlinkSync(file);
    }
  });
});

test('challenge 2: arithmetic expressions', async (t) => {
  await t.test('examples from the assignment', () => {
    assert.equal(solveLine('10 – 2 ='), '10 – 2 = 8');
    assert.equal(solveLine('100 * ( 2 + 12 ) ='), '100 * ( 2 + 12 ) = 1400');
    assert.equal(
      solveLine('(10 + 5^2) ( (5*-2) + 9 - 3^3) / 2='),
      '(10 + 5^2) ( (5*-2) + 9 - 3^3) / 2 = -490',
    );
  });

  await t.test('precedence, associativity and unary minus', () => {
    assert.equal(evaluate('2 + 3 * 4'), 14);
    assert.equal(evaluate('10 - 4 - 3'), 3);
    assert.equal(evaluate('2^3^2'), 512);
    assert.equal(evaluate('-3^2'), -9);
    assert.equal(evaluate('(-3)^2'), 9);
    assert.equal(evaluate('2^-1'), 0.5);
    assert.equal(evaluate('--5'), 5);
  });

  await t.test('all bracket types and implicit multiplication', () => {
    assert.equal(evaluate('{[1 + 2] * (3 + 4)}'), 21);
    assert.equal(evaluate('2(3)(4)'), 24);
    assert.equal(evaluate('.5 + 1.25'), 1.75);
  });

  await t.test('formats floating-point results cleanly', () => {
    assert.equal(solveLine('0.1 + 0.2 ='), '0.1 + 0.2 = 0.3');
    assert.equal(solveLine('1 / 3 ='), '1 / 3 = 0.333333333333');
  });

  await t.test('reports errors on the line instead of crashing', () => {
    assert.match(solveLine('5 / 0 ='), /= Error: Division by zero$/);
    assert.match(solveLine('(1 + 2 ='), /Error: Missing closing/);
    assert.match(solveLine('(1 + 2] ='), /Error: Mismatched brackets/);
    assert.match(solveLine('2 + a ='), /Error: Invalid character "a"/);
    assert.match(solveLine('1.2.3 ='), /Error: Invalid number/);
    assert.match(solveLine('3 + ='), /Error: Unexpected end/);
    assert.equal(solveLine(''), '');
  });
});

test('challenge 3: email message', async (t) => {
  const image = path.join(__dirname, '../challenge-3-send-email/assets/sample.png');
  const student = { name: 'Test Student', semester: '6', branch: 'CSE', rollNumber: '42' };

  await t.test('builds subject, body and attachment', () => {
    const msg = buildMessage({ from: 'a@x.com', to: 'hr@ignitershub.com', student, attachmentPath: image });
    assert.equal(msg.subject, SUBJECT);
    assert.equal(msg.subject, 'Challenge 3 Completed');
    for (const value of Object.values(student)) assert.ok(msg.text.includes(value));
    assert.equal(msg.attachments.length, 1);
    assert.equal(msg.attachments[0].contentType, 'image/png');
  });

  await t.test('rejects missing details and non-image attachments', () => {
    assert.throws(
      () => buildMessage({ from: 'a', to: 'b', student: { ...student, rollNumber: '' }, attachmentPath: image }),
      /Roll number/,
    );
    assert.throws(() => validateImage(__filename), /PNG, JPG or JPEG/);

    const fake = path.join(os.tmpdir(), `fake-${process.pid}.png`);
    fs.writeFileSync(fake, 'not really a png');
    try {
      assert.throws(() => validateImage(fake), /not a valid PNG/);
    } finally {
      fs.unlinkSync(fake);
    }
  });
});

test('challenge 4: palindrome checker', () => {
  assert.equal(describe('racecar'), "The string 'racecar' is a palindrome.");
  assert.equal(describe('hello'), "The string 'hello' is not a palindrome.");
  assert.ok(isPalindrome('A man, a plan, a canal: Panama'));
  assert.ok(isPalindrome('Madam'));
  assert.ok(isPalindrome('12321'));
  assert.ok(isPalindrome('a'));
  assert.ok(!isPalindrome('ab'));
  assert.ok(!isPalindrome('!!!'));
});
