import security from './security.js';
import {Telegraf} from 'telegraf';
import functions from './functions.mjs';
import moment from "moment";
import {readFileSync} from "fs";

const stickers = JSON.parse(readFileSync('./stickers.json'));

const bot = new Telegraf(security.TELEGRAM_BOT_TOKEN);

const STATE_NORMAL = 'normal';
const STATE_CLASS = 'waiting for a class';
const WRONG_NUMBER = 'wrong number';
const WRONG_LETTER = 'wrong letter'

let state = STATE_NORMAL;
let users_class = null, users_letter = null, users_grade = null;
users_grade = "9";
users_letter = 'в';

bot.telegram.setMyCommands([
    {command: '/start', description: 'Начать общение с ботом.'},
    {command: '/set_class', description: 'Установить класс. Обязательная функция для пользования ботом.'},
    {command: '/when_school_bell', description: 'Когда звонок?'},
    {command: '/current_lesson', description: 'Какая сейчас пара?'},
    {command: '/next_lesson', description: 'Какая следующая пара?'},
    {command: '/timetable_today', description: 'Расписание на сегодня.'},
    {command: '/timetable_tomorrow', description: 'Расписание на завтра.'}
]);

bot.on('message', async ctx => {
    const text = ctx.message.text;
    const textLC = text.toLowerCase(); // textLC - text in lower case
    const from = ctx.from;
    const chatId = ctx.chat.id;
    if (textLC === '/start') {
        await bot.telegram.sendMessage(chatId, `Привет, ${from.first_name}! В каком вы классе?`);
        state = STATE_CLASS;
        return 0;
    } else if (textLC === '/set_class') {
        state = STATE_CLASS;
        return bot.telegram.sendMessage(chatId, `В каком вы классе?`);
    } else if (
        textLC === '/when_school_bell' ||
        (textLC.includes('когда') &&
            (textLC.includes('урок') || textLC.includes('пара') || textLC.includes('звонок') || textLC.includes('перемена'))
        )
    ) {
        if (users_grade == null || users_letter == null) {
            return bot.telegram.sendMessage(chatId, 'Для начала установите свой класс с помощью команды /set_class')
        } else {
            let json = await readFileSync('./fake_json/licey.json');
            json = await JSON.parse(json);
            const todayDay = moment().format('dddd').toLowerCase();
            //current mode of learning(online/offline)
            let current = "offline";
            if (json.stuff.timetable.offline.period[0] === null && json.stuff.timetable.online.period[0] !== null)
                current = "online"
            else if (json.stuff.timetable.offline.period[0] === null && json.stuff.timetable.online.period[0] === null)
                current = null;
            if (current === undefined)
                return bot.telegram.sendMessage(chatId, 'Извините, у нас нету актуального расписания.')
            let periodStart =
                moment(json.stuff.timetable[current].period[0], 'DD.MM.YYYY')
                    .unix();
            let periodEnd;
            if (json.stuff.timetable[current].period[1] === null)
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
            // console.log('period: ' + [periodStart, periodEnd === null]);
            // console.log('today: ' + today);
            if (periodEnd === null && today < periodStart) {
                return bot.telegram.sendMessage(chatId, 'Извините, у нас имеется расписание, которое будет действовать только после ' + moment(json.stuff.timetable[current].period[0], 'DD.MM.YYYY').format('DD.MM.YYYY') + ' включительно.\nВы можете запросить его лишь кода оно будет актуально с помощью той же команды /when_school_bell')
            } else if (
                (today >= periodStart && today <= periodEnd) ||
                (today >= periodStart && periodEnd === null)
            ) {
                let bell = functions.when_school_bell(
                    json.stuff.timetable[current].pares,
                    moment().format('HH:m'),
                    json["classes"][users_grade][users_letter]["lessons"][todayDay].length
                );
                return bot.telegram.sendMessage(chatId, bell)
            } else
                return bot.telegram.sendMessage(chatId, 'Приносим свои извинения.\nРасписание заполнено некоректно.\nПостараемся это исправить в ближайшее время.')
        }
    } else if (
        textLC === '/timetable_today' ||
        (textLC.includes('сегодня') && (textLC.includes('расписание') || textLC.includes('уроки') || textLC.includes('пары')))
    ) {
        if (users_grade == null || users_letter == null) {
            return bot.telegram.sendMessage(chatId, 'Для начала установите свой класс с помощью команды /set_class')
        } else {
            let json = await readFileSync('./fake_json/licey.json');
            json = await JSON.parse(json);
            let todayDay = moment().format('dddd').toLowerCase()
            let timetable = json["classes"][users_grade][users_letter]["lessons"][todayDay];
            timetable = timetable.map((el, index) => `${index + 1}. ${el}`)
            if (timetable == null)
                return bot.telegram.sendMessage(chatId, 'Сегодня уроков нет.')
            else
                return bot.telegram.sendMessage(chatId, `Расписание на сегодня:\n${timetable.join('\n')}`);
        }
    } else if (
        textLC === '/timetable_tomorrow' ||
        (textLC.includes('завтра') && (textLC.includes('расписание') || textLC.includes('уроки') || textLC.includes('пары')))
    ) {
        if (users_grade == null || users_letter == null) {
            return bot.telegram.sendMessage(chatId, 'Для начала установите свой класс с помощью команды /set_class')
        } else {
            let json = await readFileSync('./fake_json/licey.json');
            json = await JSON.parse(json);
            let tomorrowDay = moment().add(1, 'days').format('dddd').toLowerCase()
            let timetable = json["classes"][users_grade][users_letter]["lessons"][tomorrowDay];
            timetable = timetable.map((el, index) => `${index + 1}. ${el}`)
            if (timetable == null)
                return bot.telegram.sendMessage(chatId, 'Завтра уроков нет.')
            else
                return bot.telegram.sendMessage(chatId, `Расписание на завтра:\n${timetable.join('\n')}`);
        }
    } else if (
        textLC === '/current_lesson' ||
        (textLC.includes('сейчас') && (textLC.includes('пара') || textLC.includes('урок')))
    ) {
        if (users_grade == null || users_letter == null) {
            return bot.telegram.sendMessage(chatId, 'Для начала установите свой класс с помощью команды /set_class')
        } else {
            let json = readFileSync('./fake_json/licey.json');
            json = JSON.parse(json);
            let lessons = json["classes"][users_grade][users_letter]["lessons"][moment().format('dddd').toLowerCase()];

            const todayDay = moment().format('dddd').toLowerCase();
            //current mode of learning(online/offline)
            let current = "offline";
            if (json.stuff.timetable.offline.period[0] === null && json.stuff.timetable.online.period[0] !== null)
                current = "online"
            else if (json.stuff.timetable.offline.period[0] === null && json.stuff.timetable.online.period[0] === null)
                current = null;
            if (current === undefined)
                return bot.telegram.sendMessage(chatId, 'Извините, у нас нету актуального расписания.')
            let periodStart =
                moment(json.stuff.timetable[current].period[0], 'DD.MM.YYYY')
                    .unix();
            let periodEnd;
            if (json.stuff.timetable[current].period[1] === null)
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
            // console.log('period: ' + [periodStart, periodEnd === null]);
            // console.log('today: ' + today);
            if (periodEnd === null && today < periodStart) {
                return bot.telegram.sendMessage(chatId, 'Извините, у нас имеется расписание, которое будет действовать только после ' + moment(json.stuff.timetable[current].period[0], 'DD.MM.YYYY').format('DD.MM.YYYY') + ' включительно.\nВы можете запросить его лишь кода оно будет актуально с помощью той же команды /when_school_bell')
            } else if (
                (today >= periodStart && today <= periodEnd) ||
                (today >= periodStart && periodEnd === null)
            ) {
                let current_lesson = functions.current_lesson(
                    lessons,
                    json["stuff"]["timetable"][current]["pares"],
                    json["classes"][users_grade][users_letter]["lessons"][todayDay].length
                );
                return bot.telegram.sendMessage(chatId, `${current_lesson}`);
            } else
                return bot.telegram.sendMessage(chatId, 'Приносим свои извинения.\nРасписание заполнено некоректно.\nПостараемся это исправить в ближайшее время.')
        }
    } else if (
        textLC === '/next_lesson' ||
        ( textLC.includes('следующая') && textLC.includes('пара') ) ||
        ( textLC.includes('следующий') && textLC.includes('урок') )
    ) {
        if (users_grade == null || users_letter == null) {
            return bot.telegram.sendMessage(chatId, 'Для начала установите свой класс с помощью команды /set_class')
        } else {
            let json = readFileSync('./fake_json/licey.json');
            json = JSON.parse(json);
            let lessons = json["classes"][users_grade][users_letter]["lessons"][moment().format('dddd').toLowerCase()];

            const todayDay = moment().format('dddd').toLowerCase();
            //current mode of learning(online/offline)
            let current = "offline";
            if (json.stuff.timetable.offline.period[0] === null && json.stuff.timetable.online.period[0] !== null)
                current = "online"
            else if (json.stuff.timetable.offline.period[0] === null && json.stuff.timetable.online.period[0] === null)
                current = null;
            if (current === undefined)
                return bot.telegram.sendMessage(chatId, 'Извините, у нас нету актуального расписания.')
            let periodStart =
                moment(json.stuff.timetable[current].period[0], 'DD.MM.YYYY')
                    .unix();
            let periodEnd;
            if (json.stuff.timetable[current].period[1] === null)
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
            // console.log('period: ' + [periodStart, periodEnd === null]);
            // console.log('today: ' + today);
            if (periodEnd === null && today < periodStart) {
                return bot.telegram.sendMessage(chatId, 'Извините, у нас имеется расписание, которое будет действовать только после ' + moment(json.stuff.timetable[current].period[0], 'DD.MM.YYYY').format('DD.MM.YYYY') + ' включительно.\nВы можете запросить его лишь кода оно будет актуально с помощью той же команды /when_school_bell')
            } else if (
                (today >= periodStart && today <= periodEnd) ||
                (today >= periodStart && periodEnd === null)
            ) {
                let current_lesson = functions.next_lesson(
                    lessons,
                    json["stuff"]["timetable"][current]["pares"],
                    json["classes"][users_grade][users_letter]["lessons"][todayDay].length
                );
                return bot.telegram.sendMessage(chatId, `${current_lesson}`);
            } else
                return bot.telegram.sendMessage(chatId, 'Приносим свои извинения.\nРасписание заполнено некоректно.\nПостараемся это исправить в ближайшее время.')
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