import { Telegraf } from 'telegraf';
import dayjs from 'dayjs';
import { hit as hitCounter, get as getUsage } from 'countapi-js';

const token = process.env.BOT_TOKEN;
const webhookURL = process.env.WEBHOOK_URL;
const port = Number(process.env.PORT || 4006);

const bot = new Telegraf(token as string);

bot.start((ctx) => {
  ctx.reply(`👋🏻 Welcome!\nForward me a message and I'll tell you when it was sent 👀`);
});

bot.on('forward_date', async (ctx) => {
  if (ctx.message.forward_date) {
    await hitCounter('message-date-bot', 'usage');

    ctx.reply(
      dayjs(ctx.message.forward_date * 1000).format(
        'h:mm:ss A\nD MMMM YYYY',
      ),
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
