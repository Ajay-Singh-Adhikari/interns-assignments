# Interns Assignments: Node.js, Set 1

Solutions to the four Igniters Hub internship coding challenges, written in Node.js.

| # | Challenge | Folder |
|---|-----------|--------|
| 1 | Approximate Search | [`challenge-1-approximate-search`](challenge-1-approximate-search) |
| 2 | Evaluate Arithmetic Expressions | [`challenge-2-arithmetic-expressions`](challenge-2-arithmetic-expressions) |
| 3 | Send An Email | [`challenge-3-send-email`](challenge-3-send-email) |
| 4 | Palindrome Checker | [`challenge-4-palindrome-checker`](challenge-4-palindrome-checker) |

## Setup

Requires Node.js 20.12 or later.

```bash
npm install     # installs nodemailer (only Challenge 3 needs it)
npm test        # runs the tests for all four challenges
```

---

## Challenge 1: Approximate Search

```bash
npm run challenge1                            # uses the bundled words.txt
node challenge-1-approximate-search/index.js my-words.txt --k 3
```

The program reads a text file, parses it into distinct words, and keeps them in memory. It then waits for input. Type a word, press Enter, and it prints the top *k* similar words (default 5). Type `exit` or press Ctrl+D to quit.

```
Input >> abslutly
Output >> absolutely, absolute, basically, subsequently, ability
Input >> actv
Output >> active, activity, actively, activate, activism
Input >> teh
Output >> the, tech, they, them, then
```

**How similarity is measured:** each word is scored with a weighted Damerau-Levenshtein edit distance. The weights follow common typing mistakes:

- **Missing letters are cheap.** Typos usually drop letters (`abslutly`) or abbreviate (`actv`), so filling in a missing letter costs 1.
- **Swapped neighbours are cheap.** A transposition such as `teh` → `the` costs 1.
- **Other edits cost 5.** This covers substitutions, extra letters, and letters added before the start of the word. People rarely get the start of a word wrong.

Words whose score is over a length-based limit are dropped. The rest are sorted by score. Ties go to the more common word, because `words.txt` is ordered by frequency of use. Rows of the edit-distance table are abandoned once they exceed the limit, so a search over the 16k-word list returns instantly.

`words.txt` holds the 20,000 most frequent English words from the Google Web Trillion Word corpus ([first20hours/google-10000-english](https://github.com/first20hours/google-10000-english)). It was filtered against a standard dictionary to remove misspellings and web junk such as `teh` and `seperate`. Any other text file can be passed in its place.

## Challenge 2: Evaluate Arithmetic Expressions

```bash
npm run challenge2                            # input.txt -> output.txt
node challenge-2-arithmetic-expressions/index.js in.txt out.txt
```

The program reads the input file line by line and solves each expression. It then writes a new file with each answer filled in to the right of the `=`.

```
10 – 2 = 8
100 * ( 2 + 12 ) = 1400
(10 + 5^2) ( (5*-2) + 9 - 3^3) / 2 = -490
```

- **Allowed characters:** digits, `+ - * / ^ .` and `( ) [ ] { }`. En dashes and em dashes (`–`, `—`) are read as minus signs, since the assignment's own example uses one.
- **Parser:** a hand-written recursive-descent parser. It does not use `eval`.
  - Normal precedence applies, and `^` is right-associative: `2^3^2 = 512`.
  - Unary minus works: `5*-2`, and `-3^2 = -9`.
  - Brackets must match by type.
  - Implicit multiplication works: `(a)(b)` and `2(3)`.
- **Errors:** a line with a problem gets `Error: <reason>` as its answer, and the other lines are still solved. Problems include division by zero, a bad character, and unbalanced brackets.

## Challenge 3: Send An Email

```bash
cp challenge-3-send-email/.env.example challenge-3-send-email/.env   # then edit it
node challenge-3-send-email/index.js --dry-run              # build the email, send nothing
node challenge-3-send-email/index.js --to you@example.com   # test with your own inbox
npm run challenge3                                          # send to hr@ignitershub.com
```

The program sends an email over SMTP using [nodemailer](https://nodemailer.com).

- **Subject:** "Challenge 3 Completed".
- **Body:** your name, semester, branch, and roll number, in plain text and HTML.
- **Attachment:** one image. The program checks both the extension and the file signature, so only real PNG, JPG, or JPEG files are accepted.

All settings come from `.env`, which git ignores, so your credentials are never committed.

For Gmail, turn on 2-Step Verification and create an [App Password](https://myaccount.google.com/apppasswords). Use it as `SMTP_PASS`.

## Challenge 4: Palindrome Checker

```bash
npm run challenge4
node challenge-4-palindrome-checker/index.js "A man, a plan, a canal: Panama"
```

```
Enter a string : racecar
The string 'racecar' is a palindrome.
```

Letter case, spaces, and punctuation are ignored, so whole phrases work too. The check uses two pointers moving inward from both ends.
