# Challenge 2: Evaluate Arithmetic Expressions

Reads the input file line by line, solves each arithmetic expression, and writes
a new file with every answer filled in to the right of the `=`.

## Run

```bash
npm run challenge2                                       # input.txt -> output.txt
node challenge-2-arithmetic-expressions/index.js in.txt out.txt
```

Defaults are `input.txt` → `output.txt` in this folder. The output file must be
different from the input file.

## Example

`input.txt` → `output.txt`:

```
10 – 2 = 8
100 * ( 2 + 12 ) = 1400
(10 + 5^2) ( (5*-2) + 9 - 3^3) / 2 = -490
[2 + 3] * {4 - 1} = 15
2^3^2 = 512
-3^2 = -9
7 / 2 = 3.5
0.1 + 0.2 = 0.3
{ [ (1 + 2) * 3 ] ^ 2 } / 9 = 9
5 / (3 - 3) = Error: Division by zero
```

## How it works

A **hand-written recursive-descent parser** — it does **not** use `eval`.

- **Allowed characters:** digits, `+ - * / ^ .` and the brackets `( ) [ ] { }`.
  En/em dashes (`–`, `—`) and the Unicode minus are read as `-`, since the
  assignment's own example uses an en dash.
- **Precedence** is the usual one; `^` is **right-associative** (`2^3^2 = 512`).
- **Unary minus** works (`5*-2`), and `-3^2 = -9` by the usual convention.
- **Brackets** must match by type — `(1 + 2]` is an error.
- **Implicit multiplication:** `(a)(b)` and `2(3)` multiply.
- **Clean numbers:** floating-point noise is trimmed, so `0.1 + 0.2 = 0.3`.

## Errors

A line with a problem gets `Error: <reason>` as its answer, and every other line
is still solved. Handled cases include division by zero, invalid characters,
invalid numbers (`1.2.3`), unbalanced/mismatched brackets, and incomplete
expressions. Blank lines are preserved untouched.

## Files

| File | Role |
|------|------|
| `index.js` | Reads the input file, writes the answered output file |
| `evaluator.js` | `tokenize`, `evaluate`, `solveLine`, `formatNumber` |
| `input.txt` | Sample expressions |
| `output.txt` | Generated answers (regenerate with `npm run challenge2`) |

## Tests

Covered by `npm test`: the assignment examples, precedence/associativity, unary
minus, every bracket type, implicit multiplication, clean float formatting, and
each error path.
