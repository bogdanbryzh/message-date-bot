import { Telegraf } from 'telegraf';
import dayjs from 'dayjs';
import { hit as hitCounter, get as getUsage } from 'countapi-js';
import pluralize from 'pluralize';
import replyWithDate from './replyWithDate';

const token = process.env.BOT_TOKEN as string;
const webhookURL = process.env.WEBHOOK_URL as string;
const namespace = process.env.NAMESPACE as string;
const port = Number(process.env.PORT || 4006);

const bot = new Telegraf(token);

bot.start((ctx) => {
  ctx.reply(
    `👋🏻 Welcome!\nForward me a message and I'll tell you when it was sent 👀`,
  );
});

bot.command('usage', async (ctx) => {
  const { value, status } = await getUsage(namespace, 'usage');

  if (status === 200)
    ctx.reply(`${value} ${pluralize('message', value)} reached so far!`);
  else ctx.reply('Network or countapi problems');
});

bot.command('date', async (ctx) => {
  const { from, chat } = ctx.message;

  if (from.id === chat.id)
    return ctx.reply('This option is available only in groups');
  replyWithDate(ctx.message.date, { ctx, ns: namespace });
});

bot.on('forward_date', async (ctx) => {
  if (ctx.message.forward_date) {
    replyWithDate(ctx.message.forward_date, { ctx, ns: namespace });
  } else {
    ctx.reply('huh, ping @bogdanbpeterson');
    console.log(ctx);
  }
});

bot.on('message', (ctx) => {
  const { from, chat } = ctx.message;

  if (from.id === chat.id) return ctx.reply('Please forward, not send 🙃');
  ctx.reply('Please, tag instead of reply 🙃');
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
