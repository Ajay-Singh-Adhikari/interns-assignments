'use strict';

/*
 * Recursive-descent evaluator for arithmetic expressions.
 *
 * Grammar (lowest to highest precedence):
 *   expression := term (('+' | '-') term)*
 *   term       := unary (('*' | '/') unary | <implicit> power)*
 *   unary      := ('+' | '-') unary | power
 *   power      := primary ('^' unary)?          (right-associative)
 *   primary    := number | '(' expression ')' | '[' ... ']' | '{' ... '}'
 *
 * Implicit multiplication: a number or bracket directly followed by an
 * opening bracket, as in "2(3)" or "(10 + 5^2) ((5*-2) + 9)", is a
 * multiplication.
 *
 * "-3^2" evaluates to -9, the usual mathematical convention.
 */

const OPEN_TO_CLOSE = { '(': ')', '[': ']', '{': '}' };
const CLOSERS = new Set(Object.values(OPEN_TO_CLOSE));

// Dash variants that word processors substitute for the minus sign
// (en dash, em dash, Unicode minus). The challenge's own example uses "–".
const DASHES = /[‒–—−]/g;

function tokenize(input) {
  const src = input.replace(DASHES, '-');
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
    } else if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      const text = src.slice(i, j);
      if (!/^(\d+\.?\d*|\.\d+)$/.test(text)) {
        throw new Error(`Invalid number "${text}"`);
      }
      tokens.push({ type: 'num', value: Number(text) });
      i = j;
    } else if ('+-*/^'.includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i++;
    } else if (ch in OPEN_TO_CLOSE) {
      tokens.push({ type: 'open', value: ch });
      i++;
    } else if (CLOSERS.has(ch)) {
      tokens.push({ type: 'close', value: ch });
      i++;
    } else {
      throw new Error(`Invalid character "${ch}"`);
    }
  }
  return tokens;
}

function evaluate(input) {
  const tokens = tokenize(input);
  if (tokens.length === 0) throw new Error('Empty expression');
  let pos = 0;

  const peek = () => tokens[pos];
  const isOp = (tok, ...ops) => tok && tok.type === 'op' && ops.includes(tok.value);

  function expression() {
    let value = term();
    while (isOp(peek(), '+', '-')) {
      const op = tokens[pos++].value;
      const rhs = term();
      value = op === '+' ? value + rhs : value - rhs;
    }
    return value;
  }

  function term() {
    let value = unary();
    for (;;) {
      const tok = peek();
      if (isOp(tok, '*', '/')) {
        pos++;
        const rhs = unary();
        if (tok.value === '/') {
          if (rhs === 0) throw new Error('Division by zero');
          value /= rhs;
        } else {
          value *= rhs;
        }
      } else if (tok && (tok.type === 'open' || tok.type === 'num')) {
        value *= power(); // implicit multiplication
      } else {
        return value;
      }
    }
  }

  function unary() {
    if (isOp(peek(), '+', '-')) {
      const op = tokens[pos++].value;
      const value = unary();
      return op === '-' ? -value : value;
    }
    return power();
  }

  function power() {
    const base = primary();
    if (isOp(peek(), '^')) {
      pos++;
      const exponent = unary(); // allows 2^-1 and right-associative 2^3^2
      const result = base ** exponent;
      if (Number.isNaN(result)) {
        throw new Error('Result is not a real number');
      }
      return result;
    }
    return base;
  }

  function primary() {
    const tok = tokens[pos++];
    if (!tok) throw new Error('Unexpected end of expression');
    if (tok.type === 'num') return tok.value;
    if (tok.type === 'open') {
      const value = expression();
      const close = tokens[pos++];
      if (!close || close.type !== 'close') {
        throw new Error(`Missing closing "${OPEN_TO_CLOSE[tok.value]}"`);
      }
      if (close.value !== OPEN_TO_CLOSE[tok.value]) {
        throw new Error(
          `Mismatched brackets: "${tok.value}" closed by "${close.value}"`,
        );
      }
      return value;
    }
    throw new Error(`Unexpected "${tok.value}"`);
  }

  const result = expression();
  if (pos < tokens.length) throw new Error(`Unexpected "${tokens[pos].value}"`);
  if (!Number.isFinite(result)) throw new Error('Result is too large');
  return result;
}

/** Formats a result, trimming floating-point noise like 0.1 + 0.2. */
function formatNumber(value) {
  const rounded = Number(value.toPrecision(12));
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

/**
 * Solves one line of the input file. Returns the line with the answer
 * filled in on the right-hand side of "=". Blank lines stay unchanged,
 * and invalid expressions get an error message in place of the answer.
 */
function solveLine(line) {
  if (!line.trim()) return line;
  const eq = line.indexOf('=');
  const lhs = (eq === -1 ? line : line.slice(0, eq)).trimEnd();
  try {
    return `${lhs} = ${formatNumber(evaluate(lhs))}`;
  } catch (err) {
    return `${lhs} = Error: ${err.message}`;
  }
}

module.exports = { evaluate, solveLine, tokenize, formatNumber };
