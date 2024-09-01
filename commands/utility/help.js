const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('How to play the game!'),

  async execute(interaction) {
    return interaction.reply(`Help given...`);
  }
}