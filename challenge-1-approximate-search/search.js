'use strict';

const fs = require('node:fs');

/*
 * Edit costs, in integer units so scores never suffer from floating-point
 * drift.
 *
 * The weights follow common typing mistakes:
 * - People usually misspell a word by leaving letters out ("abslutly" for
 *   "absolutely") or by abbreviating it ("actv" for "active"), so
 *   inserting a missing letter is cheap.
 * - Swapping two neighbouring letters ("teh" for "the") is just as common,
 *   so a transposition is cheap too.
 * - People rarely get the start of a word wrong, so letters inserted
 *   before the query's first character cost as much as a substitution.
 *   This keeps "helo" from matching "theology".
 */
const COST = {
  insert: 1, // the word has a character the query lacks
  leadingInsert: 5, // ...and that character comes before the query starts
  delete: 5, // the query has a character the word lacks
  substitute: 5,
  transpose: 1, // two adjacent characters swapped ("teh" -> "the")
};

/**
 * Reads a text file and returns its distinct words in order of first
 * appearance. A frequency-ordered word list therefore keeps its ranking:
 * a lower index means a more common word.
 */
function loadWords(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const tokens = text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || [];
  return [...new Set(tokens)];
}

/**
 * Weighted Damerau-Levenshtein distance (optimal string alignment variant)
 * from `query` to `word`. Returns Infinity as soon as every alignment
 * exceeds `limit`, so most of the dictionary is rejected early.
 */
function weightedDistance(query, word, limit = Infinity) {
  const n = query.length;
  const m = word.length;
  let prevPrev = null;
  let prev = new Array(m + 1);
  for (let j = 0; j <= m; j++) prev[j] = j * COST.leadingInsert;

  for (let i = 1; i <= n; i++) {
    const curr = new Array(m + 1);
    curr[0] = i * COST.delete;
    let rowMin = curr[0];
    for (let j = 1; j <= m; j++) {
      const same = query[i - 1] === word[j - 1];
      let best = Math.min(
        prev[j - 1] + (same ? 0 : COST.substitute),
        prev[j] + COST.delete,
        curr[j - 1] + COST.insert,
      );
      if (
        prevPrev &&
        i > 1 &&
        j > 1 &&
        query[i - 1] === word[j - 2] &&
        query[i - 2] === word[j - 1]
      ) {
        best = Math.min(best, prevPrev[j - 2] + COST.transpose);
      }
      curr[j] = best;
      if (best < rowMin) rowMin = best;
    }
    if (rowMin > limit) return Infinity;
    prevPrev = prev;
    prev = curr;
  }
  return prev[m] <= limit ? prev[m] : Infinity;
}

/** Largest score still treated as "similar" for a query of this length. */
function maxCostFor(query) {
  return Math.max(COST.substitute, Math.round(query.length * 2));
}

/**
 * Returns the top `k` words in `words` most similar to `query`.
 * Ranking: lowest edit cost first; ties go to the word that appears
 * earlier in the source file, which means the more common word for a
 * frequency-ordered list.
 */
function approximateSearch(words, query, k = 5) {
  const q = String(query).trim().toLowerCase();
  if (!q) return [];

  const limit = maxCostFor(q);
  // Only deletions shorten a word, so they bound how short a match can be.
  const minLen = q.length - Math.floor(limit / COST.delete);
  const maxLen = q.length + Math.floor(limit / COST.insert);

  const matches = [];
  for (let rank = 0; rank < words.length; rank++) {
    const word = words[rank];
    if (word.length < minLen || word.length > maxLen) continue;
    const cost = weightedDistance(q, word, limit);
    if (cost !== Infinity) matches.push({ word, cost, rank });
  }

  matches.sort((a, b) => a.cost - b.cost || a.rank - b.rank);
  return matches.slice(0, k).map((m) => m.word);
}

module.exports = { loadWords, approximateSearch, weightedDistance, COST };
