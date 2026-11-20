'use strict';

/**
 * Returns true if `text` reads the same backwards as forwards.
 *
 * Letter case, spaces, and punctuation are ignored, so phrases like
 * "A man, a plan, a canal: Panama" count as palindromes. Unicode letters
 * and digits are kept, and comparison is per code point, not per UTF-16
 * unit.
 */
function isPalindrome(text) {
  const chars = [...String(text).toLowerCase()].filter((c) =>
    /[\p{L}\p{N}]/u.test(c),
  );
  if (chars.length === 0) return false;
  for (let i = 0, j = chars.length - 1; i < j; i++, j--) {
    if (chars[i] !== chars[j]) return false;
  }
  return true;
}

function describe(text) {
  return `The string '${text}' ${isPalindrome(text) ? 'is' : 'is not'} a palindrome.`;
}

module.exports = { isPalindrome, describe };
