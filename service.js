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

/**
 * Generates an attack message with the damage dealt.
 * @param {Number} damage 
 * @returns 
 */
const getAttackMessage = (damage) => {
  const messages = [
    "Good job! Your attack has landed! It dealt " + damage + " damage to the monster!",
    "Well done! Your strike hit the mark, dealing " + damage + " damage to the monster!",
    "Nice work! Your attack was successful and caused " + damage + " damage to the monster!",
    "Great hit! You inflicted " + damage + " damage on the monster!",
    "Awesome! Your attack connected and dealt " + damage + " damage to the monster!",
    "Excellent! Your blow struck true, inflicting " + damage + " damage on the monster!",
    "Fantastic! You delivered a powerful hit, causing " + damage + " damage to the monster!",
    "Bravo! Your attack landed perfectly, dealing " + damage + " damage to the monster!",
    "Impressive! You dealt " + damage + " damage to the monster with that attack!",
    "Your attack was spot-on, inflicting " + damage + " damage to the monster!",
    "You successfully hit the monster, causing " + damage + " damage!"
  ];
  
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

module.exports = { checkRule, getAttackMessage };