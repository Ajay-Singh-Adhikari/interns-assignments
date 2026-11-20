# Challenge 1: Approximate Search

Reads a text file, parses it into distinct words held in memory, then waits for
input. Type a word and press Enter to get the most similar words back. Type
`exit` or press Ctrl+D to quit.

## Run

```bash
npm run challenge1                                 # uses the bundled words.txt
node challenge-1-approximate-search/index.js my-words.txt --k 3
```

- First argument (optional): path to the word-list text file. Defaults to the
  bundled `words.txt`.
- `--k N` (optional): how many suggestions to show. Default is 5.

## Example

```
Input >> abslutly
Output >> absolutely, absolute, basically, subsequently, ability
Input >> actv
Output >> active, activity, actively, activate, activism
Input >> teh
Output >> the, tech, they, them, then
```

## How similarity is measured

Each candidate word is scored with a **weighted Damerau–Levenshtein edit
distance** (integer costs, so scores never drift with floating point). The
weights model how people actually mistype:

| Edit | Cost | Why |
|------|------|-----|
| Insert a missing letter | 1 | Typos usually drop letters (`abslutly`) or abbreviate (`actv`). |
| Transpose two neighbours | 1 | `teh` → `the` is one of the commonest slips. |
| Substitute / extra letter / leading insert | 5 | People rarely get the **start** of a word wrong, so these are expensive. |

Words scoring above a length-based limit are dropped. The rest are sorted by
score; ties go to the word that appears earlier in the file — for a
frequency-ordered list that means the more common word wins. Edit-distance rows
are abandoned as soon as they exceed the limit, so a search over the 16k-word
list returns instantly.

## Word list

`words.txt` holds the most frequent English words from the Google Web Trillion
Word corpus ([first20hours/google-10000-english](https://github.com/first20hours/google-10000-english)),
filtered against a dictionary to drop misspellings and web junk. Any other text
file can be passed in its place.

## Files

| File | Role |
|------|------|
| `index.js` | CLI: argument parsing + interactive read/print loop |
| `search.js` | `loadWords`, `approximateSearch`, `weightedDistance` |
| `words.txt` | Default frequency-ordered word list |

## Tests

Covered by the repo-level suite (`npm test`): the two assignment examples,
transpositions, case-insensitivity, the `--k` limit, gibberish returning
nothing, and parsing an arbitrary text file.
