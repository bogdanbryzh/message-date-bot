import dayjs from 'dayjs';
import { hit as hitCounter } from 'countapi-js';

export default async (date: number, ns: string) => {
  await hitCounter(ns, 'usage');

  return dayjs(date * 1000).format('h:mm:ss A\nD MMMM YYYY');
};
