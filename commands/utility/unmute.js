const { SlashCommandBuilder } = require('@discordjs/builders');
const { unmute } = require('../../service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute-attack-notifications')
    .setDescription('Unmutes attack notifications'),

  async execute(interaction) {
    unmute();
    return interaction.reply(`Attack notifications have been enabled.`);
  }
}