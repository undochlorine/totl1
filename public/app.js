"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const functions_js_1 = __importDefault(require("./functions.js"));
const moment_1 = __importDefault(require("moment"));
const fs_1 = require("fs");
//path relative to the app
let prtta = './';
(() => {
    try {
        //trying to figure out if the app was launched by bash
        (0, fs_1.readFileSync)('./fake_json/lyceum.json');
    }
    catch (e) {
        prtta = './../';
    }
})();
let json_path = `${prtta}fake_json/lyceum.json`;
const security = JSON.parse((0, fs_1.readFileSync)(`${prtta}private/security.json`).toString());
const bot = new telegraf_1.Telegraf(security["TELEGRAM_BOT_TOKEN"]);
const users = [];
function handleAnError(action) {
    console.log(action);
    switch (action.e.path) {
        case json_path:
            return bot.telegram.sendMessage(action.chatId, 'Информация утеряна, порпобуйте позже.');
        default:
            return bot.telegram.sendMessage(action.chatId, `Попробуйте позже.`);
    }
}
function lessonsForADay(json, classData, day) {
    return json["classes"][classData[0]][classData[1]]["lessons"][day];
}
function getTodayDay() {
    return (0, moment_1.default)().format('dddd').toLowerCase();
}
function takeUser(id) {
    let newUser = true;
    let index = -1;
    for (let i = 0; i < users.length; i++) {
        if (users[i].id === id) {
            newUser = false;
            index = i;
            break;
        }
    }
    if (newUser) {
        let user = {
            id: id,
            users_letter: null,
            users_grade: null,
            gpa: undefined,
            wannaVariants: undefined,
            marks: [],
            marksMgsId: undefined
        };
        index = users.length;
        users.push(user);
    }
    let response = [index, newUser];
    return response;
}
const marks_keys = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: '1', callback_data: 'mark1' },
                { text: '2', callback_data: 'mark2' }
            ],
            [
                { text: '3', callback_data: 'mark3' },
                { text: '4', callback_data: 'mark4' },
                { text: '5', callback_data: 'mark5' }
            ]
        ]
    }
};
const markNeed = 0.60;
const class_letter_keys = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: 'А', callback_data: 'class_letter_А' },
                { text: 'Б', callback_data: 'class_letter_Б' },
                { text: 'В', callback_data: 'class_letter_В' }
            ],
            [
                { text: 'Г', callback_data: 'class_letter_Г' },
                { text: 'Д', callback_data: 'class_letter_Д' },
                { text: 'Е', callback_data: 'class_letter_Е' }
            ]
        ]
    }
};
const class_grade_keys = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: '8', callback_data: 'class_grade_8' },
                { text: '9', callback_data: 'class_grade_9' },
                { text: '10', callback_data: 'class_grade_10' },
                { text: '11', callback_data: 'class_grade_11' }
            ]
        ]
    }
};
bot.telegram.setMyCommands([
    { command: '/start', description: 'Начать общение с ботом.' },
    { command: '/set_class', description: 'Установить класс.' },
    { command: '/when_school_bell', description: 'Когда звонок?' },
    { command: '/current_lesson', description: 'Какая сейчас пара?' },
    { command: '/next_lesson', description: 'Какая следующая пара?' },
    { command: '/timetable_today', description: 'Расписание на сегодня.' },
    { command: '/timetable_tomorrow', description: 'Расписание на завтра.' },
    { command: '/count_marks', description: 'Узнать средний бал.' },
    { command: '/events', description: 'Последние события в лицее и в мире.' }
]);
bot.on('message', async (ctx) => {
    // @ts-ignore
    const text = ctx.message.text;
    const textLC = text.toLowerCase(); // textLC - message text in lower case
    const chatId = ctx.chat.id;
    const newUserData = takeUser(ctx.from.id);
    const user = users[newUserData[0]];
    const newUser = newUserData[1];
    if (newUser)
        console.log(ctx.from.first_name, ctx.from.last_name);
    if (textLC === '/start') {
        await (async () => {
            try {
                user.users_grade = null;
                user.users_letter = null;
                return bot.telegram.sendMessage(chatId, `Привет, ${ctx.from.first_name}! В каком вы классе?`, class_grade_keys);
            }
            catch (e) {
                await handleAnError({ e, chatId });
            }
        })();
        return 1;
    }
    else if (textLC === '/set_class') {
        await (async () => {
            try {
                user.users_grade = null;
                user.users_letter = null;
                return bot.telegram.sendMessage(chatId, `В каком вы классе?`, class_grade_keys);
            }
            catch (e) {
                await handleAnError({ e, chatId });
            }
        })();
        return 1;
    }
    else if (textLC === '/when_school_bell' ||
        (textLC.includes('когда') &&
            (textLC.includes('урок') || textLC.includes('пара') || textLC.includes('звонок') || textLC.includes('перемена')))) {
        await (async () => {
            try {
                if (user.users_grade === null || user.users_letter === null) {
                    return bot.telegram.sendMessage(chatId, 'Для начала установите свой класс с помощью команды /set_class');
                }
                let json = await (0, fs_1.readFileSync)(json_path);
                json = await JSON.parse(json);
                const todayDay = getTodayDay();
                //currentStudyMode mode of learning(online/offline)
                let currentStudyMode = "offline";
                if (json["stuff"]["timetable"][currentStudyMode]["period"][0] === null && json["stuff"]["timetable"][currentStudyMode]["period"][1] === null)
                    currentStudyMode = "online";
                if (json["stuff"]["timetable"]["online"]["period"][0] === null && json["stuff"]["timetable"]["online"]["period"][1] === null)
                    currentStudyMode = undefined;
                if (!currentStudyMode)
                    return bot.telegram.sendMessage(chatId, 'Извините, у нас нету актуального расписания.');
                let periodStart = (0, moment_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][0], 'DD.MM.YYYY')
                    .unix();
                let periodEnd = (0, moment_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][1], 'DD.MM.YYYY')
                    .unix();
                let today = (0, moment_1.default)(todayDay, 'dddd').unix();
                //проверяем расписание на актуальность
                if ((Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && today > periodEnd) ||
                    (!Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && !(today > periodStart && today < periodEnd)) ||
                    (Number.isNaN(periodEnd) && !Number.isNaN(periodStart) && today < periodStart)) {
                    if (currentStudyMode === "offline")
                        currentStudyMode = "online";
                    else
                        currentStudyMode = "offline";
                    periodStart = (0, moment_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][0], 'DD.MM.YYYY')
                        .unix();
                    periodEnd = (0, moment_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][1], 'DD.MM.YYYY')
                        .unix();
                }
                if ((!Number.isNaN(periodEnd) && today > periodEnd) ||
                    (!Number.isNaN(periodStart) && today < periodStart))
                    return bot.telegram.sendMessage(chatId, 'У нас отсутствует акуальное расписание, попробуйте позже.');
                if ((!Number.isNaN(periodEnd) && today <= periodEnd && Number.isNaN(periodStart)) ||
                    (!Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && today >= periodStart && today <= periodEnd) ||
                    (!Number.isNaN(periodStart) && today >= periodStart && Number.isNaN(periodEnd))) {
                    let amountLessons;
                    if (json["classes"][user.users_grade][user.users_letter]["lessons"][todayDay] === null)
                        amountLessons = 4;
                    else
                        amountLessons = json["classes"][user.users_grade][user.users_letter]["lessons"][todayDay].length;
                    let bell = functions_js_1.default.when_school_bell(json["classes"][user.users_grade][user.users_letter]["lessons"][todayDay], json["classes"][user.users_grade][user.users_letter]["lessons"], json["stuff"]["timetable"][currentStudyMode]["pares"], amountLessons);
                    return bot.telegram.sendMessage(chatId, bell);
                }
                return bot.telegram.sendMessage(chatId, 'Приносим свои извинения.\nРасписание заполнено некоректно.\nПостараемся это исправить в ближайшее время.');
            }
            catch (e) {
                await handleAnError({ e, chatId });
            }
        })();
        return 1;
    }
    else if (textLC === '/timetable_today' ||
        (textLC.includes('сегодня') && (textLC.includes('расписание') || textLC.includes('уроки') || textLC.includes('пары')))) {
        await (async () => {
            try {
                if (user.users_grade == null || user.users_letter == null)
                    return bot.telegram.sendMessage(chatId, 'Для начала установите свой класс с помощью команды /set_class');
                let json = await (0, fs_1.readFileSync)(json_path);
                json = await JSON.parse(json);
                let todayDay = (0, moment_1.default)().format('dddd').toLowerCase();
                let timetable = lessonsForADay(json, [user.users_grade, user.users_letter], todayDay);
                if (timetable === null)
                    return bot.telegram.sendMessage(chatId, 'Сегодня уроков нет.');
                return bot.telegram.sendMessage(chatId, `Расписание на сегодня:\n${timetable.map((el, index) => `${index + 1}. ${el}`).join('\n')}`);
            }
            catch (e) {
                await handleAnError({ e, chatId });
            }
        })();
        return 1;
    }
    else if (textLC === '/timetable_tomorrow' ||
        (textLC.includes('завтра') && (textLC.includes('расписание') || textLC.includes('уроки') || textLC.includes('пары')))) {
        await (async () => {
            try {
                if (user.users_grade == null || user.users_letter == null)
                    return bot.telegram.sendMessage(chatId, 'Для начала установите свой класс с помощью команды /set_class');
                let json = await (0, fs_1.readFileSync)(json_path);
                json = await JSON.parse(json);
                let tomorrowDay = (0, moment_1.default)().add(1, 'days').format('dddd').toLowerCase();
                let timetable = lessonsForADay(json, [user.users_grade, user.users_letter], tomorrowDay);
                if (timetable === null)
                    return bot.telegram.sendMessage(chatId, 'Завтра уроков нет.');
                return bot.telegram.sendMessage(chatId, `Расписание на завтра:\n${timetable.map((el, index) => `${index + 1}. ${el}`).join('\n')}`);
            }
            catch (e) {
                await handleAnError({ e, chatId });
            }
        })();
        return 1;
    }
    else if (textLC === '/current_lesson' ||
        (textLC.includes('сейчас') && (textLC.includes('пара') || textLC.includes('урок')))) {
        await (async () => {
            try {
                if (user.users_grade == null || user.users_letter == null)
                    return bot.telegram.sendMessage(chatId, 'Для начала установите свой класс с помощью команды /set_class');
                let json = await (0, fs_1.readFileSync)(json_path);
                json = await JSON.parse(json);
                const todayDay = getTodayDay();
                let lessons = lessonsForADay(json, [user.users_grade, user.users_letter], todayDay);
                //currentStudyMode mode of learning(online/offline)
                let currentStudyMode = "offline";
                if (json["stuff"]["timetable"][currentStudyMode]["period"][0] === null && json["stuff"]["timetable"][currentStudyMode]["period"][1] === null)
                    currentStudyMode = "online";
                if (json["stuff"]["timetable"]["online"]["period"][0] === null && json["stuff"]["timetable"]["online"]["period"][1] === null)
                    currentStudyMode = undefined;
                if (!currentStudyMode)
                    return bot.telegram.sendMessage(chatId, 'Извините, у нас нету актуального расписания.');
                let periodStart = (0, moment_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][0], 'DD.MM.YYYY')
                    .unix();
                let periodEnd = (0, moment_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][1], 'DD.MM.YYYY')
                    .unix();
                let today = (0, moment_1.default)(todayDay, 'dddd').unix();
                //проверяем расписание на актуальность
                if ((Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && today > periodEnd) ||
                    (!Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && !(today > periodStart && today < periodEnd)) ||
                    (Number.isNaN(periodEnd) && !Number.isNaN(periodStart) && today < periodStart)) {
                    if (currentStudyMode === "offline")
                        currentStudyMode = "online";
                    else
                        currentStudyMode = "offline";
                    periodStart = (0, moment_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][0], 'DD.MM.YYYY')
                        .unix();
                    periodEnd = (0, moment_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][1], 'DD.MM.YYYY')
                        .unix();
                }
                if ((!Number.isNaN(periodEnd) && today > periodEnd) ||
                    (!Number.isNaN(periodStart) && today < periodStart))
                    return bot.telegram.sendMessage(chatId, 'У нас отсутствует акуальное расписание, попробуйте позже.');
                if ((!Number.isNaN(periodEnd) && today <= periodEnd && Number.isNaN(periodStart)) ||
                    (!Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && today >= periodStart && today <= periodEnd) ||
                    (!Number.isNaN(periodStart) && today >= periodStart && Number.isNaN(periodEnd))) {
                    let amountLessons;
                    if (json["classes"][user.users_grade][user.users_letter]["lessons"][todayDay] === null)
                        amountLessons = 4;
                    else
                        amountLessons = json["classes"][user.users_grade][user.users_letter]["lessons"][todayDay].length;
                    let current_lesson = functions_js_1.default.current_lesson(lessons, json["stuff"]["timetable"][currentStudyMode]["pares"], amountLessons);
                    return bot.telegram.sendMessage(chatId, `${current_lesson}`);
                }
                return bot.telegram.sendMessage(chatId, 'Приносим свои извинения.\nРасписание заполнено некоректно.\nПостараемся это исправить в ближайшее время.');
            }
            catch (e) {
                await handleAnError({ e, chatId });
            }
        })();
        return 1;
    }
    else if (textLC === '/next_lesson' ||
        (textLC.includes('следующая') && textLC.includes('пара')) ||
        (textLC.includes('следующий') && textLC.includes('урок'))) {
        await (async () => {
            try {
                if (user.users_grade === null || user.users_letter === null)
                    return bot.telegram.sendMessage(chatId, 'Для начала установите свой класс с помощью команды /set_class');
                let json = await (0, fs_1.readFileSync)(json_path);
                json = await JSON.parse(json);
                const todayDay = getTodayDay();
                let lessons = lessonsForADay(json, [user.users_grade, user.users_letter], todayDay);
                //currentStudyMode mode of learning(online/offline)
                let currentStudyMode = "offline";
                if (json["stuff"]["timetable"][currentStudyMode]["period"][0] === null && json["stuff"]["timetable"][currentStudyMode]["period"][1] === null)
                    currentStudyMode = "online";
                if (json["stuff"]["timetable"]["online"]["period"][0] === null && json["stuff"]["timetable"]["online"]["period"][1] === null)
                    currentStudyMode = undefined;
                if (!currentStudyMode)
                    return bot.telegram.sendMessage(chatId, 'Извините, у нас нету актуального расписания.');
                let periodStart = (0, moment_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][0], 'DD.MM.YYYY')
                    .unix();
                let periodEnd = (0, moment_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][1], 'DD.MM.YYYY')
                    .unix();
                let today = (0, moment_1.default)(todayDay, 'dddd').unix();
                //проверяем расписание на актуальность
                if ((Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && today > periodEnd) ||
                    (!Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && !(today > periodStart && today < periodEnd)) ||
                    (Number.isNaN(periodEnd) && !Number.isNaN(periodStart) && today < periodStart)) {
                    if (currentStudyMode === "offline")
                        currentStudyMode = "online";
                    else
                        currentStudyMode = "offline";
                    periodStart = (0, moment_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][0], 'DD.MM.YYYY')
                        .unix();
                    periodEnd = (0, moment_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][1], 'DD.MM.YYYY')
                        .unix();
                }
                if ((!Number.isNaN(periodEnd) && today > periodEnd) ||
                    (!Number.isNaN(periodStart) && today < periodStart))
                    return bot.telegram.sendMessage(chatId, 'У нас отсутствует акуальное расписание, попробуйте позже.');
                if ((!Number.isNaN(periodEnd) && today <= periodEnd && Number.isNaN(periodStart)) ||
                    (!Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && today >= periodStart && today <= periodEnd) ||
                    (!Number.isNaN(periodStart) && today >= periodStart && Number.isNaN(periodEnd))) {
                    let amountLessons;
                    if (json["classes"][user.users_grade][user.users_letter]["lessons"][todayDay] === null)
                        amountLessons = 4;
                    else
                        amountLessons = json["classes"][user.users_grade][user.users_letter]["lessons"][todayDay].length;
                    let next_lesson = functions_js_1.default.next_lesson(lessons, json["stuff"]["timetable"][currentStudyMode]["pares"], amountLessons);
                    return bot.telegram.sendMessage(chatId, `${next_lesson}`);
                }
                return bot.telegram.sendMessage(chatId, 'Приносим свои извинения.\nРасписание заполнено некоректно.\nПостараемся это исправить в ближайшее время.');
            }
            catch (e) {
                await handleAnError({ e, chatId });
            }
        })();
        return 1;
    }
    else if (textLC === '/count_marks') {
        await (async () => {
            try {
                user.marks = [];
                return bot.telegram.sendMessage(chatId, 'Введите свои оценки по определённому предмету:', marks_keys);
            }
            catch (e) {
                await handleAnError({ e, chatId });
            }
        })();
        return 1;
    }
    else if (textLC === '/events') {
        await (async () => {
            try {
                let json = (0, fs_1.readFileSync)(json_path);
                json = await JSON.parse(json);
                let events = json["stuff"]["events"];
                await (async () => {
                    for (let i = 0; i < events.length; i++) {
                        await bot.telegram.sendMessage(chatId, events[i]);
                    }
                })();
                return 1;
            }
            catch (e) {
                await handleAnError({ e, chatId });
            }
        })();
        return 1;
    }
    return bot.telegram.sendMessage(chatId, `Я вас не понимаю.`);
});
bot.on('callback_query', async (msg) => {
    //@ts-ignore
    const chatId = msg.chat.id;
    //@ts-ignore
    const data = msg.callbackQuery.data;
    //@ts-ignore
    const newUserData = takeUser(msg.from.id);
    const user = users[newUserData[0]];
    // если ввел оценку - добавляем в массив
    if (['mark1', 'mark2', 'mark3', 'mark4', 'mark5'].includes(data)) {
        await (async () => {
            try {
                //добавляем оценку
                user.marks.push(Number(data.charAt(data.length - 1)));
                let sum = user.marks.reduce((acc, next) => acc + next);
                user.gpa = Number((sum / user.marks.length).toFixed(2));
                let wannaUpBtn = {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Не устраивает', callback_data: 'wanna_up' }]
                        ]
                    }
                };
                // если средний бал выше 4.60 то некуда уже подниматься
                if (user.gpa >= (4 + markNeed))
                    wannaUpBtn = {
                        reply_markup: {
                            inline_keyboard: [
                                []
                            ]
                        }
                    };
                //если это первая вводимая оценка - просто выводим ее
                if (user.marks[1] === undefined) {
                    await bot.telegram.sendMessage(chatId, `Ваши оценки: ${user.marks.join(', ')}\nВаш средний бал: ${user.gpa}`, wannaUpBtn)
                        .then((msgInfo) => {
                        user.marksMgsId = msgInfo.message_id;
                    });
                }
                // либо редактируем уже имеющееся сообщение
                else
                    await bot.telegram.editMessageText(chatId, user.marksMgsId, undefined, `Ваши оценки: ${user.marks.join(', ')}\nВаш средний бал: ${user.gpa}`, wannaUpBtn);
            }
            catch (e) {
                await handleAnError({ e, chatId });
            }
        })();
    }
    else if (data === 'wanna_up') {
        await (async () => {
            try {
                //если нажал на кнопку "не устраивает"
                let min = -1;
                //если оценка 3.22 -> предлагаем 4, 5
                //если оценка 3.79 -> предлагаем 5 потому что у него уже есть 4ка
                if (user.gpa !== undefined && Math.floor(user.gpa) === Math.floor(user.gpa - markNeed))
                    min = Math.floor(user.gpa) + 2;
                else if (user.gpa !== undefined)
                    min = Math.floor(user.gpa) + 1;
                user.wannaVariants = [];
                for (let i = min; i <= 5; i++) {
                    user.wannaVariants.push(i);
                }
                let wannaButtons = user.wannaVariants.map(el => ({ text: String(el), callback_data: `wanna_${el}` }));
                await bot.telegram.sendMessage(chatId, 'Какую оценку вы хотите иметь?', {
                    reply_markup: {
                        inline_keyboard: [
                            wannaButtons
                        ]
                    }
                });
            }
            catch (e) {
                await handleAnError({ e, chatId });
            }
        })();
    }
    else if (data.includes('wanna_')) {
        await (async () => {
            try {
                //если выбрал какую оценку хочет к примеру 4
                const chosenMark = Number(data.charAt(data.length - 1));
                //chosenMark = 4
                const wannaValue = chosenMark - (1 - markNeed);
                //wannaValue = 3,60
                let min = -1;
                if (user.gpa !== undefined && Math.floor(user.gpa) === Math.floor(user.gpa - markNeed))
                    min = Math.floor(user.gpa) + 2;
                else if (user.gpa !== undefined)
                    min = Math.floor(user.gpa) + 1;
                let need = {};
                //пробуем все оценки которые ему могут помочь
                for (let i = min; i <= 5; i++) {
                    //не портим массив marks
                    let localMarks = [...user.marks];
                    let needQ = 0;
                    //если хотим 4, а i = 3, то не поможем, значит итерируемся дальше
                    if (i < wannaValue)
                        continue;
                    //пока не поможем
                    while (true) {
                        needQ++;
                        localMarks.push(i);
                        if ((localMarks.reduce((acc, next) => acc + next) / localMarks.length) >= wannaValue)
                            break;
                    }
                    //заполняем объект структорой {5: 19}, где нужно 19 пятёрок
                    need[`${i}`] = needQ;
                }
                //делаем из объекта готовую строку
                let needStr = ``;
                for (let i = 0; i < Object.keys(need).length; i++) {
                    if (i === 0)
                        needStr += `${Object.values(need)[i]} "${Object.keys(need)[i]}"`;
                    else
                        needStr += ` или ${Object.values(need)[i]} "${Object.keys(need)[i]}"`;
                }
                await bot.telegram.sendMessage(chatId, `Для этого вам нужно получить ${needStr}`);
            }
            catch (e) {
                await handleAnError({ e, chatId });
            }
        })();
    }
    else if (data.includes('class_grade_')) {
        await (async () => {
            try {
                user.users_grade = Number(data.charAt(data.length - 1));
                if (user.users_grade === 1)
                    user.users_grade = 11;
                else if (user.users_grade === 0)
                    user.users_grade = 10;
                if (user.users_letter !== null)
                    return bot.telegram.sendMessage(chatId, `Ваш класс: ${user.users_grade}-${user.users_letter.toUpperCase()}`);
                return bot.telegram.sendMessage(chatId, 'Буква вашего класса:', class_letter_keys);
            }
            catch (e) {
                await handleAnError({ e, chatId });
            }
        })();
    }
    else if (data.includes('class_letter_')) {
        await (async () => {
            try {
                user.users_letter = data.charAt(data.length - 1).toLowerCase();
                if (user.users_grade !== null)
                    return bot.telegram.sendMessage(chatId, `Ваш класс: ${user.users_grade}-${user.users_letter.toUpperCase()}`);
                return bot.telegram.sendMessage(chatId, `В каком вы классе?`, class_grade_keys);
            }
            catch (e) {
                await handleAnError({ e, chatId });
            }
        })();
    }
    return 1;
});
bot.launch();
