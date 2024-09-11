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
const guildId = process.env.GUILD_ID;

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
let DEAD_NOTIF_SENT = false;

///////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////// UTILITY FUNCTIONS ////////////////////////////////////
const spawnWrapper = () => {
	const guild = client.guilds.cache.get(guildId);
	spawnMonster(HEALTH_PER_MEMBER * guild.memberCount);

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

	// Scheduling the monster spawn job. This job will run everyday at 10:00 AM.
  const job = schedule.scheduleJob('0 10 * * *', () => {
		console.log('It\'s 10:00 AM, time to spawn monsters!');
		
		// 1. Setting the rules for the day
		console.log('Setting rules for today...');
		setRules();
		const rules = obtainRules();
		console.log(`Rules: \n \t1. ${rules[0].name} \n \t2. ${rules[1].name}`);

		// 2. Spawning the monster
		spawnWrapper();
		DEAD_NOTIF_SENT = false;
	});
	console.log(`Monster spawn job scheduled at ${job.nextInvocation()}`);

	// 3. The bot is ready and listening to messages
  console.log("Ready!");
	console.log("------------------------------------");
	console.log("Listening to messages... \n");
})

/**
 * Runs whenever a new interaction is created
 * This part of the code is responsible for handling slash commands
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
 * Listen to messages. Will run everytime a new message is sent by any user in the server
 * This part of the code is responsible for handling messages
 * NOTE: This bot will only listen to messages in the 'general' channel
 */
client.on(Events.MessageCreate, message => {
  if (message.author.bot) return; // If the message is sent by a bot, do not process it
	if (checkHealth() <= 0) return; // If the monster is already dead, do not process any more messages
	if (message.channel.name !== 'general') return; // If the message is not sent in the 'general' channel, do not process it

	console.log("--> " + message.content);
	const originalContent = message.content;

	// Split the message into separate words
	const words = originalContent.split(" ");

	let damage = 0;

	// Check each word if it is valid
	for (const word of words) {
		try {
			if (checkRule(word) && wordExists(word)) {
				console.log(`The word "${word}" is valid.`);
				damage += word.length; // If valid, add the length of the word as damage
			} else {
				if (!wordExists(word)) {
					console.log(`The word "${word}" does not exist in the English dictionary.`);
					// Note that we are using a predefined library of words, so new words might not be included
					// TODO: Improve this by using a more comprehensive dictionary
				} else {
					console.log(`The word "${word}" is invalid.`);
					// This happens when the word breaks one or two of the rules
				}
			}
		} catch (error) {
			console.error(error);
		}
	}

	// If any of the words are valid, attack the monster
	if (damage > 0) {
		console.log(`Total damage: ${damage}`);
		attackMonster(damage);
		console.log(`Current health: ${checkHealth()}`);

		if (!checkMuted()) {
			message.reply(getAttackMessage(damage));
		}
		// TODO: Create a tracking feature that tracks each persons damage dealt per day
	}

	// Check if the monster is dead or not
	const currentHealth = checkHealth();
	const guild = client.guilds.cache.get(guildId);
	const generalChannel = guild.channels.cache.find(channel => channel.name === 'general');
	if (currentHealth <= 0 && !DEAD_NOTIF_SENT) {
		generalChannel.send(` \`\`\`
 ,-=-.  
/  +  \\    
| ~~~ |    
|R.I.P|  
|_____|
			\`\`\` `);
		generalChannel.send(`Good job! Vorazk has been defeated! But beware, he will return soon! 🧛‍♂️`);
		DEAD_NOTIF_SENT = true;
	}
});

// Run the client by logging in with your Token
client.login(token);