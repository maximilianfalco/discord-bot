const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Replies with your input!')
    .addStringOption(option =>
      option.setName('input')
        .setDescription('The input to echo back')
        .setRequired(true)),

  async execute(interaction) {
    const input = interaction.options.getString('input');
    return interaction.reply(`This is your echo: ${input}`);
  }
}