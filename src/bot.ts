import { Telegraf } from 'telegraf';
import dayjs from 'dayjs';
import { hit as hitCounter, get as getUsage } from 'countapi-js';
import pluralize from 'pluralize';

const token = process.env.BOT_TOKEN as string;
const webhookURL = process.env.WEBHOOK_URL as string;
const namespace = process.env.NAMESPACE as string;
const port = Number(process.env.PORT || 4006);

const bot = new Telegraf(token);

bot.start((ctx) => {
  ctx.reply(
    "👋🏻 Welcome!\nForward me a message and I'll tell you when it was sent 👀",
  );
});

bot.help((ctx) => {
  ctx.reply(
    'A tiny 🤖 to get actual date of a message.\nNo custom commands are provided for now.',
  );
});

bot.command('usage', async (ctx) => {
  const { value, status } = await getUsage(namespace, 'usage');

  if (status !== 200) return ctx.reply('Network or countapi problems');

  ctx.reply(`${value} ${pluralize('message', value)} reached so far!`);
});

bot.command('utc', (ctx) => {
  ctx.replyWithHTML(
    'UTC stands for Universal Time Coordinated. More on <a href="https://en.wikipedia.org/wiki/Coordinated_Universal_Time">Wikipedia</a>',
  );
});

bot.on('forward_date', async (ctx) => {
  if (!ctx.message.forward_date) {
    console.log('forward_date', ctx);
    return ctx.reply('huh, ping @bogdanbpeterson');
  }

  await hitCounter(namespace, 'usage');

  ctx.reply(
    `This message was sent on ${dayjs(ctx.message.forward_date * 1000).format(
      'h:mm:ss A of D MMMM YYYY UTC',
    )}`,
    {
      reply_to_message_id: ctx.message.message_id,
    },
  );
});

bot.on('text', (ctx) => {
  if (/^\//.test(ctx.message.text))
    return ctx.reply('Unknown command. Try /help');

  ctx.reply(
    `Current time is ${dayjs().format('h:mm:ss A of D MMMM YYYY UTC')}`,
  );
});

bot.catch((err, ctx) => {
  console.log('error', err);
  console.log('ctx', ctx);
});

bot.launch({
  webhook: {
    domain: webhookURL,
    port,
  },
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
