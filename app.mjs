import security from './security.js';
import { Telegraf } from 'telegraf';
import stickers from './stickers.js';
import fetch from 'node-fetch';
import functions from './functions.js';
const bot = new Telegraf(security.TELEGRAM_BOT_TOKEN);
const STATE_NORMAL = 'normal';
const STATE_CLASS = 'waiting a class';
const STATE_CONFIRMATION = 'waiting a confirmation';
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
		[users_grade, users_letter] = functions.valid_class(users_class);
		if ((users_grade !== null) && (users_letter !== null)) {
			state = STATE_CONFIRMATION;
			return bot.telegram.sendMessage(chatId, `${users_grade}-${users_letter}?`);
		} else {
			state = STATE_NORMAL;
		}
	} else if (state === STATE_CONFIRMATION) {
		state = STATE_NORMAL;
		if (textLC === 'yes' || textLC === 'да' || textLC === 'конечно' || textLC === 'именно' || textLC === 'верно' || textLC === 'в яблочко' || textLC === 'sure' || textLC === 'exactly' || textLC === 'yeh' || textLC === 'yup')
		{
			return bot.telegram.sendMessage(chatId, 'Окей')
		} else {
			[users_grade, users_letter] = [null, null];
			return bot.telegram.sendMessage(chatId, 'Хорошо. Используйте команду /set_class чтобы попробовать ещё.')
		}
	}

	return bot.telegram.sendMessage(chatId, `Я вас не понимаю.`);
});

bot.launch();