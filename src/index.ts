import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import mongoose from 'mongoose';

import { Client, GatewayIntentBits } from 'discord.js';
import { Ana } from './commands/Ana';
import { Roll } from './commands/Roll';
import { Plugins } from './commands/Plugins';
import { Familia } from './commands/Familia';
import { commands } from './commands/CommandList';
import express from 'express';
import routes from './routes/routes';
import { Momento } from './commands/Momento';
import { getInfo } from './commands/PegarInfo';
import { Skins } from './commands/Skins';
import { Quote } from './commands/Citacao';
import { Help } from './commands/Ajuda';
import { Token } from './commands/Token';
import { Supporter } from './commands/Apoiador';
import { PaymentsController } from './controllers/PaymentsController';
import { Backup } from './commands/Backup';
import { Logs } from './commands/Logs';
import schedule from 'node-schedule';
import { requestBackupStart } from './utils/requestBackupStart';

const app = express();
app.use(express.json());
app.use(routes);

export const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const TOKEN = process.env.TOKEN as string;
const CLIENT_ID = process.env.CLIENT_ID as string;
const dbUrl = process.env.MONGODB_URI || '';

const rest = new REST({ version: '10' }).setToken(TOKEN);

async function startServer() {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');

    client.login(TOKEN);
  } catch (error) {
    console.error(error);
  }
}

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log('Conectado ao banco de dados');
    startServer();
  })
  .catch((err) => {
    console.log(err);
  });

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  client.user?.setPresence({
    activities: [{ name: '/comandos', type: undefined }],
    status: 'online',
  });
});

client.on('interactionCreate', async (interaction: any) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
  if (interaction.commandName === 'ana') {
    Ana(interaction);
  }
  if (interaction.commandName === 'roll') {
    Roll(interaction);
  }
  if (interaction.commandName === 'plugins') {
    const page = interaction.options.get('page')?.value || 1;
    new Plugins().listPlugins(interaction, page);
  }
  if (interaction.commandName === 'familia') {
    if (interaction.options.getSubcommand() === 'listar') {
      new Familia().listFamilies(interaction);
    }
  }
  if (interaction.commandName === 'momento') {
    new Momento().momento(interaction);
  }
  if (interaction.commandName === 'skins') {
    new Skins().sendTutorial(interaction);
  }
  if (interaction.commandName === 'listar') {
    if (interaction.options.getSubcommand() === 'momentos') {
      new Momento().listMomentos(interaction);
    }
    if (interaction.options.getSubcommand() === 'tokens') {
      new Token().listTokens(interaction);
    }
  }
  if (interaction.commandName === 'citacao') {
    new Quote().quote(interaction);
  }
  if (interaction.commandName === 'pegarinfo') {
    if (interaction.options.getSubcommand() === 'foto') {
      new getInfo().returnUserPhoto(interaction);
    }
    if (interaction.options.getSubcommand() === 'id') {
      new getInfo().returnUserID(interaction);
    }
  }
  if (interaction.commandName === 'comandos') {
    new Help().help(interaction);
  }
  if (interaction.commandName === 'meajudapeloamordedeus') {
    new Help().vando(interaction);
  }
  if (interaction.commandName === 'token') {
    new Token().generateToken(interaction);
  }
  if (interaction.commandName === 'apoiador') {
    if (interaction.options.getSubcommand() === 'validar') {
      new PaymentsController().validatePayment(interaction);
    } else if (interaction.options.getSubcommand() === 'limpar') {
      new PaymentsController().clearPayment(interaction);
    } else {
      new Supporter().generatePayment(interaction);
    }
  }
  if (interaction.commandName == 'backup') {
    new Backup().startBackup(interaction);
  }
  if (interaction.commandName == 'logs') {
    const fileName = interaction.options.getString('nome');
    if (fileName) {
      new Logs().getLog(interaction);
    } else {
      new Logs().getLogsNames(interaction);
    }
  }
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

schedule.scheduleJob('0 7 * * *', async () => {
  try {
    await requestBackupStart();
  } catch (err) {
    console.log(err);
  }
});
