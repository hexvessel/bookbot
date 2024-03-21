const {
  SlashCommandBuilder,
  EmbedBuilder,
  Integration,
} = require("discord.js");
const model = require("../../model");
const logger = require("../../logger");

const regexUrlString =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
const regexTitleString = /^[A-Za-z0-9\s\-_,\.;:()]+$/;

const regexUrl = new RegExp(regexUrlString);
const regexTitle = new RegExp(regexTitleString);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addbook")
    .setDescription("Add a Book")
    .addStringOption((option) =>
      option.setName("title").setDescription("Book Title")
    )
    .addStringOption((option) =>
      option.setName("link").setDescription("Link to Book Vendor")
    ),
  async execute(interaction) {
    const title = interaction.options.get("title");
    const link = interaction.options.get("link");
    const user = interaction.user.globalName;

    //11 bækur max
    const howManyBooks = await model.findAll();
    if (howManyBooks.length > 10) {
      logger.warn("Book Overflow.");
      return interaction.reply(`Too Many Books 11/11`);
    }
    //sanitization
    if (!link.value.match(regexUrl)) {
      logger.warn("Adding Book with Invalid URL regex.");
      return interaction.reply(`Valid URL Required.`);
    }
    if (!title.value.match(regexTitle)) {
      logger.warn("Adding Book with invalid title regex.");
      return interaction.reply(`No special characters in title.`);
    }

    try {
      const tag = await model.create({
        title: title.value,
        link: link.value,
        user: user,
      });
      const tagList = await model.findAll();

      //https://discordjs.guide/popular-topics/embeds.html#embed-preview
      if (tagList.length < 6) {
        /**Bókalisti er innan marka fyrir hámarkslengd á embed skilaboðum  */
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`Bókalisti ${tagList.length}/11`)
          .setTimestamp()
          .setFooter({
            text: `README \n"/addbook titill hlekkur" til að bæta við bók \n "/votebook kosninganr" til að kjósa titil`,
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
          `Bókinni '${title.value} bætt í listann af ${user}. Fjöldi bóka er ${tagList.length}.`
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
          `Bókinni '${title.value} bætt í listann af ${user}. Fjöldi bóka er ${tagList.length}.`
        );
        await interaction.reply({ embeds: [first_embed] });
        return await interaction.followUp({ embeds: [second_embed] });
      }
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        logger.error(error);
        return interaction.reply("SequelizeUniqueConstraintError");
      }
      logger.error(error);
      return interaction.reply("Hmm, Villa :(");
    }
  },
};
