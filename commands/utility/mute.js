const { SlashCommandBuilder } = require('@discordjs/builders');
const { mute } = require('../../service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute-attack-notifications')
    .setDescription('Mutes attack notifications'),

  async execute(interaction) {
    mute();
    return interaction.reply(`Attack notifications have been disabled.`);
  }
}