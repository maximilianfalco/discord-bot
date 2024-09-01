const { SlashCommandBuilder } = require('@discordjs/builders');
const { obtainRules } = require("../../rules");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('view-rules')
    .setDescription('Valid attacks for today!'),

  async execute(interaction) {
    const rules = obtainRules();
    return interaction.reply(
      `For a word to be a valid attack, they must follow these rules: 
      \n \t1. ${rules[0].name} -> ${rules[0].description}
      \n \t2. ${rules[1].name} -> ${rules[1].description}`
    );
  }
}