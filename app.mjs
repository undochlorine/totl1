import security from './security.js';
import { Telegraf } from 'telegraf';
import stickers from './stickers.js';
import fetch from 'node-fetch';
import functions from './functions.js';
const bot = new Telegraf(security.TELEGRAM_BOT_TOKEN);
const STATE_NORMAL = 'normal';
const STATE_CLASS = 'waiting a class';
let state = STATE_NORMAL;
let users_class = null, users_letter = null, users_grade = null;

bot.telegram.setMyCommands([
	{ command: '/set_class', description: 'Установить класс. Обязательная функция для пользования ботом.' }
]);

bot.on('message', async ctx =>
{
	const textLC = ctx.message.text.toLowerCase();
	const text = ctx.message.text;
	const from = ctx.from;
	const chatId = ctx.chat.id;
	if(textLC === '/start')  {
		await bot.telegram.sendMessage(chatId, `Привет, ${from.first_name}! В каком вы классе?`);
		state = STATE_CLASS;
		return 0;
	} else if(textLC === '/set_class') {
		state = STATE_CLASS;
		return bot.telegram.sendMessage(chatId, `В каком вы классе?`);;
	}
	if (state === STATE_CLASS) {
		users_class = textLC;
		state = STATE_NORMAL;
		[users_grade, users_letter] = functions.valid_class(users_class);
		if (users_grade === 'wrong number') {
			return bot.telegram.sendMessage(chatId, 'Такого класса нет. Используйте команду /set_class чтобы попробовать ещё раз.')
		} else if (users_letter === 'wrong letter') {
			return bot.telegram.sendMessage(chatId, 'Класса с такой буквой нет. Используйте команду /set_class чтобы попробовать ещё раз.');
		} else if (users_letter === null && users_grade === null) {
		} else {
			return bot.telegram.sendMessage(chatId, `Окей. ваш класс: ${users_grade}${users_letter}`);
		}
	}

	return bot.telegram.sendMessage(chatId, `Я вас не понимаю.`);
});

bot.launch();