import security from './security.js';
import { Telegraf } from 'telegraf';
import stickers from './stickers.js';
import fetch from 'node-fetch';
const bot = new Telegraf(security.TELEGRAM_BOT_TOKEN);
let STATE_NORMAL = 'normal';
let state = STATE_NORMAL;
let STATE_CLASS = 'waiting a class';
let users_class = null, users_letter = null, users_grade = null;

function valid_class(clas) {
	let alph = 'abcdefghijklmnopqrstuvwxyz';
	let i, j;
	for (i = 0; i < clas.length; i++) {
		if ( isNaN( Number( clas.charAt(i) ) ) ) break;
	}
	users_grade = clas.slice(0, i);

	clas = clas.slice(i); // console.log(`clas = ${clas}`);

	for (j = 0; j < clas.length; j++) {
		if (!alph.includes(clas[j])) break;
	}
	let users_letter = clas.slice(0, j);
	// console.log(`letter = ${users_letter}, ${users_letter === ''}`);
	while (users_letter === '') {
		clas = clas.slice(1);
		for (j = 0; j < clas.length; j++) {
			if (!alph.includes(clas[j])) break;
		}
		// console.log(`j = ${j}`);
		users_letter = clas.slice(0, j);
	}
	
	return [users_grade, users_letter];
}

bot.on('message', async ctx =>
{
	const text = ctx.message.text.toLowerCase();
	const from = ctx.from;
	const chatId = ctx.chat.id;
	switch (text) {
		case '/start': {
			await bot.telegram.sendMessage(chatId, `Привет, ${from.first_name}! В каком вы классе?`);
			state = STATE_CLASS;
			return 0;
		}; break;
	}
	if (state === STATE_CLASS) {
		users_class = text;
		[users_grade, users_letter] = valid_class(users_class);
		bot.telegram.sendMessage(chatId, `is ${users_grade}-${users_letter}?`)
		state = STATE_NORMAL;
		return 0;
	}

	return bot.telegram.sendMessage(chatId, `Я вас не понимаю.`);
});

bot.launch();