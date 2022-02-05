import dayjs from 'dayjs';
import { hit as hitCounter } from 'countapi-js';

import type { Context } from 'telegraf';

export type Config = {
  ctx: Context & { message: { message_id: number } };
  ns: string;
};

export default async (date: number, { ctx, ns }: Config) => {
  await hitCounter(ns, 'usage');

  ctx.reply(dayjs(date * 1000).format('h:mm:ss A\nD MMMM YYYY'), {
    reply_to_message_id: ctx.message.message_id,
  });
};
