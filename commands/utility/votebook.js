const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const model = require("../../model");
const logger = require("../../logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("votebook")
    .setDescription("book vote")
    .addStringOption((option) =>
      option.setName("id").setDescription("id of vote")
    ),
  async execute(interaction) {
    const options = interaction.options.get("id");
    try {
      const v = await model.findOne({ where: { id: options.value } });
      const howManyBooks = await model.findAll();
      if (isNaN(options.value)) {
        console.log(4);
        logger.warn(`Vote Book isNaN`);
        return interaction.reply(`id = number`);
      }

      if (
        !(
          parseInt(options.value) > 0 &&
          parseInt(options.value) <= howManyBooks.length
        )
      ) {
        logger.warn(`Vote Book id range`);
        return interaction.reply(`0 < id < bókafjöldi`);
      }

      if (v) {
        v.increment("votes");
      }

      const tagList = await model.findAll();

      if (tagList.length < 6) {
        /**Bókalisti er innan marka fyrir hámarkslengd á embed skilaboðum  */
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`Bókalisti ${tagList.length}/11`)
          .setTimestamp()
          .setFooter({
            text: `README \n"/add_book titill hlekkur" til að bæta við bók \n /vote "kosninga nr" til að kjósa titil`,
          });
        tagList.forEach((entry) => {
          embed.addFields(
            { name: "Kosninga Nr", value: `${entry.id}`, inline: true },
            { name: "Fjöldi Atkvæða", value: `${entry.votes}`, inline: true },
            { name: "Bókartitill", value: `${entry.title}` },
            { name: "Notandi", value: `${entry.user}`, inline: true },
            { name: "Hlekkur á Bók", value: `${entry.link}` }
          );
        });

        logger.info(
          `${interaction.user.globalName} greiddi atkvæði með ${options.value} `
        );
        return await interaction.reply({ embeds: [embed] });
      } else {
        /**Bókalisti fer yfir 4096 tóka og þarf tvö embed skilaboð */
        const first_embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`Bókalisti 1/2`)
          .setDescription(`${tagList.length}/11`)
          .setTimestamp()
          .setFooter({
            text: `README \n"/add_book titill hlekkur" til að bæta við bók \n /vote "kosninga nr" til að kjósa titil`,
          });
        for (let i = 0; i < 5; i++) {
          first_embed.addFields(
            { name: "Kosninga Nr", value: `${tagList[i].id}`, inline: true },
            {
              name: "Fjöldi Atkvæða",
              value: `${tagList[i].votes}`,
              inline: true,
            },
            { name: "Bókartitill", value: `${tagList[i].title}` },
            { name: "Notandi", value: `${entry.user}`, inline: true },
            { name: "Hlekkur á Bók", value: `${tagList[i].link}` }
          );
        }

        const second_embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle("Bókalisti 2/2")
          .setDescription(`${tagList.length}/11`)
          .setTimestamp()
          .setFooter({
            text: `README \n"/add_book titill hlekkur" til að bæta við bók \n /vote "kosninga nr" til að kjósa titil`,
          });
        for (let i = 5; i < tagList.length; i++) {
          second_embed.addFields(
            { name: "Kosninga Nr", value: `${tagList[i].id}`, inline: true },
            {
              name: "Fjöldi Atkvæða",
              value: `${tagList[i].votes}`,
              inline: true,
            },
            { name: "Bókartitill", value: `${tagList[i].title}` },
            { name: "Notandi", value: `${entry.user}`, inline: true },
            { name: "Hlekkur á Bók", value: `${tagList[i].link}` }
          );
        }
        logger.info(
          `${interaction.user.globalName} greiddi atkvæði með ${
            tagList[options.value].title
          } `
        );
        await interaction.reply({ embeds: [first_embed] });
        return await interaction.followUp({ embeds: [second_embed] });
      }
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        logger.error(error.name);
        return interaction.reply("SequelizeUniqueConstraintError");
      }
      logger.error(error);
      return interaction.reply("Hmm, Villa :(");
    }
  },
};
