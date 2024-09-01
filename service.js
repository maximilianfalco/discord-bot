const { obtainRules } = require("./rules");

const digitRegex = /\d/;
const specialCharRegex = /[!@#]/;

/**
 * Checks if the word mathces the rule. Returns true if valid, false otherwise.
 * @param {string} word 
 */
const checkRule = (word) => {
  if (digitRegex.test(word) || specialCharRegex.test(word)) {
    return false;
  }

  const rules = obtainRules();
  const ruleRegex1 = rules[0].regex;
  const ruleRegex2 = rules[1].regex;

  if (!ruleRegex1.test(word)) {
    console.log(`Failed rule 1: ${rules[0].name}`);
    return false;
  }

  if (!ruleRegex2.test(word)) {
    console.log(`Failed rule 2: ${rules[1].name}`);
    return false;
  }

  return true;
}

module.exports = { checkRule };