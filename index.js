const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const wordExists = require('word-exists');
const schedule = require('node-schedule');

const { checkRule, getAttackMessage, checkMuted } = require('./service');
const { setRules, obtainRules } = require('./rules');
const { attackMonster, checkHealth, spawnMonster } = require('./monsters');

require('dotenv').config();
const token = process.env.TOKEN;

// Create a new bot client
const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	] 
});

//////////////////////////////////////// CONSTANTS ////////////////////////////////////////

const HEALTH_PER_MEMBER = 100;
const DAMAGE_COUNTS = new Map();
const MONSTER_SPAWN_INTERVAL = 60 // defined interval in seconds

///////////////////////////////////////////////////////////////////////////////////////////

// To create dynamic commands, we create a collection to store the commands
client.commands = new Collection();

// Navigates towards the commands folder and reads all the files in it
const foldersPath = path.join(__dirname, 'commands');

// This readdirSync navigates towards the 'utility' folder
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);

  // This readdirSync navigates towards the files (the command files) in the 'utility' folder
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		// Goes through each file and requires it, obtaining their names and the logic inside them
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module (logic contained)
		// This check basically checks if the command was properly formatted and defined
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Self defined logic

/**
 * Runs whenever the client (bot) is ready to run!
 */
client.once(Events.ClientReady, async readyClient => {
	console.log(`Logged in as ${readyClient.user.tag}`);
	console.log('Setting rules for today...');
	
	setRules();
	const rules = obtainRules();
  console.log(`Rules: \n \t1. ${rules[0].name} \n \t2. ${rules[1].name}`);

  console.log("Ready!");
	console.log("------------------------------------");
	console.log("Listening to messages... \n");

	const spawnWrapper = () => {
		const guild = client.guilds.cache.get(process.env.GUILD_ID);
		spawnMonster(HEALTH_PER_MEMBER * guild.memberCount);
		// spawnMonster(1);
	
		const generalChannel = guild.channels.cache.find(channel => channel.name === 'general');
		generalChannel.send(`Beware adventurers! A monster has appeared in the Dream Realm! Defeat it by using words that follow the rules of the day! The rules of the day are: \n \t1. ${rules[0].name} \n2. ${rules[1].name}`);
		
		generalChannel.send(`\`\`\`
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
     /                          /{_______}\\   \\          \\    \\            \\     
                               /{___/_\\___}\\   \`          \\    \`
			
			\`\`\``
		);
		generalChannel.send(`Vorazk, the Void Stalker has appeared! He has spawned with ${checkHealth()} health. Defeat him before the day ends!`);
		return;
	};

	// spawnWrapper();

	// Spawning the monster and determining its health
  const job = schedule.scheduleJob('0 10 * * *', function() {
		console.log('It\'s 10:00 AM, time to spawn monsters!');
		spawnWrapper();
	});
	console.log(`Monster spawn job scheduled at ${job.nextInvocation()}`);

})

/**
 * Runs whenever a new interaction is created
 */
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

/**
 * Listen to messages
 */
client.on(Events.MessageCreate, message => {
  if (message.author.bot) return;
	if (checkHealth() <= 0) return;

	console.log("--> " + message.content);
	const originalContent = message.content;
	const words = originalContent.split(" ");

	let damage = 0;

	for (const word of words) {
		try {
			if (checkRule(word) && wordExists(word)) {
				console.log(`The word "${word}" is valid.`);
				damage += word.length;
			} else {
				if (!wordExists(word)) {
					console.log(`The word "${word}" does not exist.`);
					// Note that we are using a predefined library of words, so new words might not be included
					// TODO: Improve this by using a more comprehensive dictionary
				} else {
					console.log(`The word "${word}" is invalid.`);
				}
			}
		} catch (error) {
			console.error(error);
		}
	}

	if (damage > 0) {
		console.log(`Total damage: ${damage}`);
		attackMonster(damage);
		console.log(`Current health: ${checkHealth()}`);

		if (!checkMuted()) {
			message.reply(getAttackMessage(damage));
		}
		// TODO: Create a tracking feature that tracks each persons damage dealt per day
	}

	const currentHealth = checkHealth();
	const guild = client.guilds.cache.get(process.env.GUILD_ID);
	const generalChannel = guild.channels.cache.find(channel => channel.name === 'general');
	if (currentHealth <= 0) {
		generalChannel.send(` \`\`\`
 ,-=-.  
/  +  \\    
| ~~~ |    
|R.I.P|  
|_____|
			\`\`\` `);
		generalChannel.send(`Good job! Vorazk has been defeated! But beware, he will return soon! 🧛‍♂️`);
	}

});

// Run the client by logging in with your Token
client.login(token);