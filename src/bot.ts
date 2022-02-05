import 'dotenv/config';
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
    `👋🏻 Welcome!\nForward me a message and I'll tell you when it was sent 👀`,
  );
});

bot.command('usage', async (ctx) => {
  const { value, status } = await getUsage(namespace, 'usage');

  if (status === 200)
    ctx.reply(`${value} ${pluralize('message', value)} reached so far!`);
  else ctx.reply('Network or countapi problems');
});

bot.on('forward_date', async (ctx) => {
  if (ctx.message.forward_date) {
    await hitCounter(namespace, 'usage');

    ctx.reply(
      dayjs(ctx.message.forward_date * 1000).format('h:mm:ss A\nD MMMM YYYY'),
      { reply_to_message_id: ctx.message.message_id },
    );
  } else {
    ctx.reply('huh, ping @bogdanbpeterson');
    console.log(ctx);
  }
});

bot.on('message', (ctx) => {
  ctx.reply('Please forward, not send 🙃');
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
