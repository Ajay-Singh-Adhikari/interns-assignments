# Challenge 4: Palindrome Checker

Checks whether a string reads the same backwards as forwards.

## Run

```bash
npm run challenge4                                            # prompts for input
node challenge-4-palindrome-checker/index.js "A man, a plan, a canal: Panama"
```

Pass the string as an argument, or run with no argument to be prompted.

## Example

```
Enter a string : racecar
The string 'racecar' is a palindrome.
```

```
The string 'A man, a plan, a canal: Panama' is a palindrome.
```

## How it works

- **Normalisation:** letter case, spaces, and punctuation are ignored, so whole
  phrases work. Only Unicode **letters and digits** are kept.
- **Comparison:** two pointers move inward from both ends, comparing per Unicode
  code point (not per UTF-16 unit), so accented and non-Latin letters compare
  correctly.
- A string with no letters or digits is **not** counted as a palindrome; at the
  prompt you'll be asked to enter something with at least one letter or digit.

## Files

| File | Role |
|------|------|
| `index.js` | CLI: argument or interactive prompt |
| `palindrome.js` | `isPalindrome` (two-pointer check) and `describe` |

## Tests

Covered by `npm test`: single words, mixed-case phrases with punctuation,
digits, single characters, and non-palindromes.
