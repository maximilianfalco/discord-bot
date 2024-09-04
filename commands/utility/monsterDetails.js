const { SlashCommandBuilder } = require('@discordjs/builders');
const { getOriginalHealth, checkHealth } = require('../../monsters');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('monster-details')
    .setDescription('Shows details about the current monster and your progress!'),

  async execute(interaction) {
    const originalHealth = getOriginalHealth();
    const currentHealth = checkHealth();
    const damage = originalHealth - currentHealth;
    const progress = Math.floor((damage / originalHealth) * 100);
    await interaction.reply(`\`\`\`
               /|                                           |\\                 
              /||             ^               ^             ||\\                
             / \\\\__          //               \\\\          __// \\               
            /  |_  \\         | \\   /     \\   / |         /  _|  \\              
           /  /  \\  \\         \\  \\/ \\---/ \\/  /         /  /     \\             
          /  /    |  \\         \\  \\/\\   /\\/  /         /  |       \\            
         /  /     \\   \\__       \\ ( 0\\ /0 ) /       __/   /        \\           
        /  /       \\     \\___    \\ \\_/|\\_/ /    ___/     /\\         \\          
       /  /         \\_)      \\___ \\/-\\|/-\\/ ___/      (_/\\ \\      \`  \\         
      /  /           /\\__)       \\/  oVo  \\/       (__/   \` \\      \`  \\        
     /  /           /,   \\__)    (_/\\ _ /\\_)    (__/         \`      \\  \\       
    /  \'           //       \\__)  (__V_V__)  (__/                    \\  \\      
   /  \'  \'        /\'           \\   |{___}|   /         .              \\  \\     
  /  \'  /        /              \\/ |{___}| \\/\\          \`              \\  \\    
 /     /        \'                \\/{_____}\\/  \\          \\    \`         \\  \\   
/                                /{_______}\\   \\          \\    \\            \\     
                                /{___/_\\___}\\   \`          \\    \`
\`\`\`` + '\n**Vorazk, the Void Stalker** \n'+ `Vorazk is a mysterious and ancient creature known for its eerie, multi-eyed gaze and its ability to blend into the shadows of the void. Its presence is often accompanied by an ominous silence, and it moves with unsettling speed and precision. The "oVo" pattern in its eyes is said to be a gateway to another dimension, where it draws its power and consumes the souls of those who dare to challenge it.` + `\n\n**Original Health:** ${originalHealth}\n**Current Health:** ${currentHealth}\n**Progress:** ${progress}%`);
  
  return;
  }
}