import mongoose from "mongoose";

const bindsSchema = new mongoose.Schema({
  players: Array,
});

const godsSchema = new mongoose.Schema({
  name: String,
  players: Array,
});

export const BindsRaffle = mongoose.model("bindsraffle", bindsSchema);

export const Gods = mongoose.model("gods", godsSchema);

function buscarDiferente(array: any, user: string) {
  let diferente;

  for (let i = 0; i < array.length; i++) {
    if (array[i] !== user) {
      diferente = array[i];
      break;
    }
  }

  return diferente;
}
export class Sorteio {
  async bindUser(interaction: any) {
    const user = "<@" + interaction.user.id + ">";
    const player = interaction.options.get("player")?.value;

    const bindGroup = [user, player];

    const checkUser = await BindsRaffle.findOne({ players: user });

    const checkPlayer = await BindsRaffle.findOne({ players: player });

    if (checkUser) {
      console.log(checkUser.players);
      const diferente = buscarDiferente(checkUser.players, user);
      interaction.reply(`Você já está vinculado a ${diferente}!`);
      return;
    }
    if (checkPlayer) {
      const diferente = buscarDiferente(checkPlayer.players, user);
      interaction.reply(`Este jogador já está vinculado com ${diferente}!`);
      return;
    }

    const bind = new BindsRaffle({
      players: bindGroup,
    });

    await bind.save();

    await interaction.reply(`Vinculando ${player} a ${user}`);
  }

  async unbindUser(interaction: any) {
    const user = "<@" + interaction.user.id + ">";

    const checkUser = await BindsRaffle.findOne({ players: user });

    if (!checkUser) {
      interaction.reply(`Você não está vinculado a ninguém!`);
      return;
    }

    const bindID = checkUser._id;

    await BindsRaffle.findByIdAndDelete(bindID);

    await interaction.reply(`Você foi desnvinculado!`);
  }

  async raffle(interaction: any) {
    const user = "<@" + interaction.user.id + ">";

    const gods = await Gods.find();

    const sortedNumber = Math.floor(Math.random() * gods.length);

    const sortedGod = gods[sortedNumber];

    const checkUser = await Gods.findOne({ players: user });

    const bindedUser = async () => {
      const checkUser = await BindsRaffle.findOne({ players: user });
      if (checkUser) {
        const diferente = buscarDiferente(checkUser.players, user);
        return diferente;
      }
    };

    const binded = await bindedUser();

    if (sortedGod.players.length >= 5 - (binded ? 1 : 0)) {
      interaction.reply(
        `A família ${sortedGod.name} já tem 5 jogadores! ou 6 se você estiver vinculado a alguém!`
      );
      return;
    }

    if (checkUser) {
      interaction.reply(`Você já foi sorteado para ${checkUser.name}!`);
      return;
    }

    const checkGod = await Gods.findOne({ players: user });

    if (checkGod) {
      interaction.reply(`Você já foi sorteado para ${checkGod.name}!`);
      return;
    }

    sortedGod.players.push(user);
    if (binded) sortedGod.players.push(binded);

    await Gods.findByIdAndUpdate(sortedGod._id, sortedGod);

    interaction.reply(`${sortedGod.name} foi sorteado para ${user}`);
  }
  async getID(interaction: any) {
    try {
      const player = interaction.options.get("player")?.value;
      if (!player) return interaction.reply("Faz direito porra!");
      interaction.reply("```" + player + "```");
    } catch (err) {
      console.log(err);
      interaction.reply("Faz direito porra!");
    }
  }
}