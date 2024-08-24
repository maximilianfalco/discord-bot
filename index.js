const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");

require('dotenv').config();
const token = process.env.TOKEN;

// Create a new bot client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });


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
  console.log("Ready!");
  console.log(`Logged in as ${readyClient.user.tag}`); 
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

  if (message.content.toLowerCase === 'ping') {
    message.reply('Pong!');
  }
});

// Run the client by logging in with your Token
client.login(token);