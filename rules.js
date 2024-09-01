class Rule {
  constructor(
    name,
    description,
    regex,
  ) {
    this.name = name;
    this.description = description;
    this.regex = regex;
  }
}

const rules = [
  new Rule(
    ">5L", 
    "The word must be more than 5 letters long.",
    /^\w{5,}$/
  ),
  new Rule(
    "<10L", 
    "The word must be less than 10 letters long.",
    /^\w{1,9}$/
  ),
  new Rule(
    "StartsWithA",
    "The word must start with the letter 'A'. Case insensitive.",
    /^A\w*/i
  ),
  new Rule(
    "EndsWithS",
    "The word must end with the letter 'S'. Case insensitive.",
    /\w*S$/i
  ),
  new Rule(
    "NoRepeatingLetters",
    "The word must not contain any repeating letters.",
    /^([a-zA-Z])(?!.*\1)[a-zA-Z]*$/
  ),
  new Rule(
    "ContainsZ",
    "The word must contain the letter 'Z'. Case insensitive.",
    /Z/i
  ),
  new Rule(
    "ContainsVowel",
    "The word must contain at least one vowel (a, e, i, o, u).",
    /[aeiouAEIOU]/
  ),
  new Rule(
    "OnlyLowercase",
    "The word must be in lowercase.",
    /^[a-z]+$/
  ),
  new Rule(
    "StartsWithConsonant",
    "The word must start with a consonant.",
    /^[b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z]\w*/
  ),
  new Rule(
    "EndsWithVowel",
    "The word must end with a vowel.",
    /\w*[aeiouAEIOU]$/
  ),
  new Rule(
    "StartsWithUppercase",
    "The word must start with an uppercase letter.",
    /^[A-Z]\w*/
  ),
  new Rule(
    "AlternatingCase",
    "The word must alternate between uppercase and lowercase letters, starting with uppercase.",
    /^([A-Z][a-z])*$/
  ),
  new Rule(
    "ContainsABCSubsequence",
    "The word must contain the subsequence 'abc' in any order (not necessarily consecutive).",
    /(?=.*a)(?=.*b)(?=.*c)/
  ),
  new Rule(
    "Palindrome",
    "The word must be a palindrome (reads the same backward as forward).",
    /^([a-zA-Z])(?:(?:(?!\1)[a-zA-Z])*\1)*$/
  ),
  new Rule(
    "NoAdjacentDuplicates",
    "The word must not contain any adjacent duplicate letters.",
    /^(?!.*(\w)\1)[a-zA-Z]+$/
  ),
];

let activeRule1 = rules[0];
let activeRule2 = rules[1];

/**
 * 
 * @param {string[]} rules 
 * @returns 
 */
const checkValidity = (rules) => {
  if (rules.includes('StartsWithUppercase') && rules.includes('OnlyLowercase')) {
    return false;
  }
  if (rules.includes('StartsWithConsonant') && rules.includes('StartsWithA')) {
    return false;
  }
  if (rules.includes('EndsWithVowel') && rules.includes('EndsWithS')) {
    return false;
  }
  if (rules.includes('AlternatingCase') && rules.includes('OnlyLowercase')) {
    return false;
  }
  if (rules.includes('NoRepeatingLetters') && rules.includes('Palindrome')) {
    return false;
  }

  return true;
}

const setRules = () => {
  let validRules = false;
  while (!validRules) {
    let index1 = Math.floor(Math.random() * rules.length);
    let index2 = Math.floor(Math.random() * rules.length);
    while (index2 === index1) {
      index2 = Math.floor(Math.random() * rules.length);
    }
    activeRule1 = rules[index1];
    activeRule2 = rules[index2];

    validRules = checkValidity([activeRule1.name, activeRule2.name]);
  }
}

const obtainRules = () => {
  return [activeRule1, activeRule2];
}

module.exports = { obtainRules, setRules, Rule };