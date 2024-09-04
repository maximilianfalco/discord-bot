const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('How to play the game!'),

  async execute(interaction) {
    return interaction.reply(`
Welcome to the Dream Realm ✨! The land of Dream Realm is a mystical place where you can find all sorts of creatures and monsters. However, evil monsters have taken over the realm and it is up to you to defeat them. Strangely enough, these monsters are illiterate and are weak against complex words. 

Each day, you will be given a set of rules that dictate what words you can use to defeat the monster. The damage of your attack is determined by the length of the word you use. The longer the word, the more damage you deal. 
    
The balance of the realm lays in your hands. Good luck, adventurer! 🫡`);
  }
}