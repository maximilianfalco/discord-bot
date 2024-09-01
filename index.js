const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const { checkRule } = require('./service');
const { setRules, obtainRules } = require('./rules');

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
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

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
  console.log("Message created!")
  if (message.author.bot) return;

	console.log("--> " + message.content);
	const originalContent = message.content;
	const words = originalContent.split(" ");

	let damage = 0;

	for (const word of words) {
		try {
			if (checkRule(word)) {
				console.log(`The word "${word}" is valid.`);
				damage += word.length;
			} else {
				console.log(`The word "${word}" is invalid.`);
			}
		} catch (error) {
			console.error(error);
		}
	}

	console.log(`Total damage: ${damage}`);

});

// Run the client by logging in with your Token
client.login(token);