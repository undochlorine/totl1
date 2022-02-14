import security from './security.js';
import { Telegraf } from 'telegraf';
import stickers from './stickers.js';
import functions from './functions.js';
import moment from "moment";
import {readFileSync} from "fs";

const bot = new Telegraf(security.TELEGRAM_BOT_TOKEN);

const STATE_NORMAL = 'normal';
const STATE_CLASS = 'waiting for a class';
const WRONG_NUMBER = 'wrong number';
const WRONG_LETTER = 'wrong letter'

let state = STATE_NORMAL;
let users_class = null, users_letter = null, users_grade = null;

bot.telegram.setMyCommands([
	{ command: '/start', description: 'Начать общение с ботом.' },
	{ command: '/set_class', description: 'Установить класс. Обязательная функция для пользования ботом.' },
	{ command: '/when_school_bell', description: 'Когда звонок?' },
	{ command: '/timetable_today', description: 'Расписание на сегодня.' },
	{ command: '/timetable_tomorrow', description: 'Расписание на завтра.' }
]);

bot.on('message', async ctx =>
{
	const text = ctx.message.text;
	const textLC = text.toLowerCase();
	const from = ctx.from;
	const chatId = ctx.chat.id;
	if(textLC === '/start') {
		await bot.telegram.sendMessage(chatId, `Привет, ${from.first_name}! В каком вы классе?`);
		state = STATE_CLASS;
		return 0;
	} else if(textLC === '/set_class') {
		state = STATE_CLASS;
		return bot.telegram.sendMessage(chatId, `В каком вы классе?`);
	} else if(
		textLC === '/when_school_bell' ||
		(textLC.includes('когда') &&
			(textLC.includes('урок') || textLC.includes('пара'))
		)
	) {
		let json = await readFileSync('./fake_json/licey.json');
		json = await JSON.parse(json);
		//current mode of learning(online/offline)
		let current = "offline";
		if(json.stuff.timetable.offline.period[0] === null && json.stuff.timetable.online.period[0] !== null)
			current = "online"
		else if(json.stuff.timetable.offline.period[0] === null && json.stuff.timetable.online.period[0] === null)
			current = null;
		if(current === undefined)
			return bot.telegram.sendMessage(chatId, 'Извините, у нас нету актуального расписания.')
		let periodStart =
			moment(json.stuff.timetable[current].period[0], 'DD.MM.YYYY')
				.unix();
		let periodEnd;
		if(json.stuff.timetable[current].period[1] === null)
			periodEnd = null
		else
			periodEnd =
				moment(json.stuff.timetable[current].period[1], 'DD.MM.YYYY')
					.unix();
		let today =
			moment(
				`${moment().format('DD')}/${moment().format('MM')}/${moment().format('YYYY')}`,
				'DD/MM/YYYY'
				)
				.unix();
		//проверяем расписание на актуальность
		console.log('period: ' + [periodStart, periodEnd === null]);
		console.log('today: ' + today);
		//todo: fill logic
		if(periodEnd === null) {
			if( today >= periodStart ) {
				return bot.telegram.sendMessage(chatId, 'Актуальное расписание')
			} else {
				return bot.telegram.sendMessage(chatId, 'Устаревшее расписание')
			}
		} else if((today >= periodStart) && (today <= periodEnd)) {
			if( today >= periodStart ) {
				return bot.telegram.sendMessage(chatId, 'Актуальное расписание')
			} else {
				return bot.telegram.sendMessage(chatId, 'Устаревшее расписание')
			}
		}

	}

	if (state === STATE_CLASS) {
		users_class = textLC;
		state = STATE_NORMAL;
		[users_grade, users_letter] = functions.valid_class(users_class);
		if (users_grade === WRONG_NUMBER) {
			return bot.telegram.sendMessage(chatId, 'Такого класса нет. Используйте команду /set_class чтобы попробовать ещё раз.')
		} else if (users_letter === WRONG_LETTER) {
			return bot.telegram.sendMessage(chatId, 'Класса с такой буквой нет. Используйте команду /set_class чтобы попробовать ещё раз.');
		} else if (users_letter === null && users_grade === null) {
			return bot.telegram.sendMessage(chatId, `Вы ввели класс некоректно, повторите попытку, использую команду /set_class`);
		} else {
			return bot.telegram.sendMessage(chatId, `Окей. ваш класс: ${users_grade}-${users_letter}`);
		}
	}

	return bot.telegram.sendMessage(chatId, `Я вас не понимаю.`);
});

bot.launch();