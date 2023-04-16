"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const functions_js_1 = __importDefault(require("./functions.js"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const fs_1 = require("fs");
const states_1 = require("./states");
const stickers_1 = __importDefault(require("./stickers"));
const dotenv = __importStar(require("dotenv"));
const generate_1 = __importDefault(require("./ceko/pkg/service/generate/generate"));
const handle_1 = __importDefault(require("./ceko/pkg/service/handle/handle"));
const path_1 = __importDefault(require("path"));
const randomSticker_1 = __importDefault(require("./ceko/pkg/service/get/randomSticker"));
moment_timezone_1.default.tz.setDefault('Europe/Chisinau');
dotenv.config();
const port = Number(process.env.PORT) || 3000;
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
const botAPI = "https://api.telegram.org/bot";
const botUrl = botAPI + process.env.TELEGRAM_BOT_TOKEN;
const bot = new telegraf_1.Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');
const users = [];
function handleAnError(action) {
    console.log(action.e);
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
    return (0, moment_timezone_1.default)().format('dddd').toLowerCase();
}
async function finishClassRecieving(chatId) {
    await bot.telegram.sendSticker(chatId, stickers_1.default.potterHat);
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
            nth: users.length + 1,
            state: states_1.STATE_NORMAL
        };
        index = users.length;
        users.push(user);
    }
    let response = [index, newUser];
    return response;
}
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
    { command: '/events', description: 'Последние события в лицее и в мире.' },
    { command: '/library', description: 'Получите доступ ко всей библиотеке знаний:' },
    { command: '/feedback', description: 'Обратная связь' }
]);
bot.command('feedback', async (ctx) => {
    await bot.telegram.sendMessage(ctx.chat.id, 'По вопросам и для обратной связи писать:\nhttps://t.me/undochlorine');
});
bot.on("sticker", async (ctx) => {
    await bot.telegram.sendSticker(ctx.chat.id, randomSticker_1.default.RandomSticker());
});
bot.on('message', async (ctx) => {
    try {
        // @ts-ignore
        const text = ctx.message.text;
        const textLC = text.toLowerCase(); // textLC - message text in lower case
        const chatId = ctx.chat.id;
        const newUserData = takeUser(ctx.from.id);
        const user = users[newUserData[0]];
        const newUser = newUserData[1];
        if (newUser) {
            let label = `${user.nth}. ${ctx.from.first_name} ${ctx.from.last_name}`;
            for (let i = label.length; i <= 75; i++) {
                label += ' ';
            }
            console.log(`${label}${(0, moment_timezone_1.default)().format('DD.MM.YYYY hh:mm')}`);
        }
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
                    let periodStart = (0, moment_timezone_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][0], 'DD.MM.YYYY')
                        .unix();
                    let periodEnd = (0, moment_timezone_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][1], 'DD.MM.YYYY')
                        .unix();
                    let today = (0, moment_timezone_1.default)(todayDay, 'dddd').unix();
                    //проверяем расписание на актуальность
                    if ((Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && today > periodEnd) ||
                        (!Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && !(today > periodStart && today < periodEnd)) ||
                        (Number.isNaN(periodEnd) && !Number.isNaN(periodStart) && today < periodStart)) {
                        if (currentStudyMode === "offline")
                            currentStudyMode = "online";
                        else
                            currentStudyMode = "offline";
                        periodStart = (0, moment_timezone_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][0], 'DD.MM.YYYY')
                            .unix();
                        periodEnd = (0, moment_timezone_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][1], 'DD.MM.YYYY')
                            .unix();
                    }
                    if ((!Number.isNaN(periodEnd) && today > periodEnd) ||
                        (!Number.isNaN(periodStart) && today < periodStart))
                        return bot.telegram.sendMessage(chatId, 'У нас отсутствует акуальное расписание, попробуйте позже.');
                    if ((!Number.isNaN(periodEnd) && today <= periodEnd && Number.isNaN(periodStart)) ||
                        (!Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && today >= periodStart && today <= periodEnd) ||
                        (!Number.isNaN(periodStart) && today >= periodStart && Number.isNaN(periodEnd))) {
                        let bell = functions_js_1.default.when_school_bell(json["classes"][user.users_grade][user.users_letter]["lessons"][todayDay], json["classes"][user.users_grade][user.users_letter]["lessons"], json["stuff"]["timetable"][currentStudyMode]["pares"]);
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
                    let todayDay = (0, moment_timezone_1.default)().format('dddd').toLowerCase();
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
                    let tomorrowDay = (0, moment_timezone_1.default)().add(1, 'days').format('dddd').toLowerCase();
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
                    let periodStart = (0, moment_timezone_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][0], 'DD.MM.YYYY')
                        .unix();
                    let periodEnd = (0, moment_timezone_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][1], 'DD.MM.YYYY')
                        .unix();
                    let today = (0, moment_timezone_1.default)(todayDay, 'dddd').unix();
                    //проверяем расписание на актуальность
                    if ((Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && today > periodEnd) ||
                        (!Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && !(today > periodStart && today < periodEnd)) ||
                        (Number.isNaN(periodEnd) && !Number.isNaN(periodStart) && today < periodStart)) {
                        if (currentStudyMode === "offline")
                            currentStudyMode = "online";
                        else
                            currentStudyMode = "offline";
                        periodStart = (0, moment_timezone_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][0], 'DD.MM.YYYY')
                            .unix();
                        periodEnd = (0, moment_timezone_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][1], 'DD.MM.YYYY')
                            .unix();
                    }
                    if ((!Number.isNaN(periodEnd) && today > periodEnd) ||
                        (!Number.isNaN(periodStart) && today < periodStart))
                        return bot.telegram.sendMessage(chatId, 'У нас отсутствует акуальное расписание, попробуйте позже.');
                    if ((!Number.isNaN(periodEnd) && today <= periodEnd && Number.isNaN(periodStart)) ||
                        (!Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && today >= periodStart && today <= periodEnd) ||
                        (!Number.isNaN(periodStart) && today >= periodStart && Number.isNaN(periodEnd))) {
                        let current_lesson = functions_js_1.default.current_lesson(lessons, json["stuff"]["timetable"][currentStudyMode]["pares"]);
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
                    let periodStart = (0, moment_timezone_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][0], 'DD.MM.YYYY')
                        .unix();
                    let periodEnd = (0, moment_timezone_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][1], 'DD.MM.YYYY')
                        .unix();
                    let today = (0, moment_timezone_1.default)(todayDay, 'dddd').unix();
                    //проверяем расписание на актуальность
                    if ((Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && today > periodEnd) ||
                        (!Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && !(today > periodStart && today < periodEnd)) ||
                        (Number.isNaN(periodEnd) && !Number.isNaN(periodStart) && today < periodStart)) {
                        if (currentStudyMode === "offline")
                            currentStudyMode = "online";
                        else
                            currentStudyMode = "offline";
                        periodStart = (0, moment_timezone_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][0], 'DD.MM.YYYY')
                            .unix();
                        periodEnd = (0, moment_timezone_1.default)(json["stuff"]["timetable"][currentStudyMode]["period"][1], 'DD.MM.YYYY')
                            .unix();
                    }
                    if ((!Number.isNaN(periodEnd) && today > periodEnd) ||
                        (!Number.isNaN(periodStart) && today < periodStart))
                        return bot.telegram.sendMessage(chatId, 'У нас отсутствует акуальное расписание, попробуйте позже.');
                    if ((!Number.isNaN(periodEnd) && today <= periodEnd && Number.isNaN(periodStart)) ||
                        (!Number.isNaN(periodStart) && !Number.isNaN(periodEnd) && today >= periodStart && today <= periodEnd) ||
                        (!Number.isNaN(periodStart) && today >= periodStart && Number.isNaN(periodEnd))) {
                        let next_lesson = functions_js_1.default.next_lesson(lessons, json["stuff"]["timetable"][currentStudyMode]["pares"]);
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
                    user.state = states_1.STATE_WAITING_FOR_A_GRADE;
                    user.marks = [];
                    return bot.telegram.sendMessage(chatId, 'Введите свои оценки по определённому предмету:', telegraf_1.Markup.keyboard([
                        ['1', '2', '3'],
                        ['4', '5']
                    ]).resize());
                }
                catch (e) {
                    await handleAnError({ e, chatId });
                }
            })();
            return 1;
        }
        else if (user.state === states_1.STATE_WAITING_FOR_A_GRADE) {
            await (async () => {
                try {
                    let isGrade = false;
                    ['1', '2', '3', '4', '5'].forEach(g => {
                        if (textLC === g)
                            isGrade = true;
                    });
                    // case where not grade was sent
                    if (!isGrade) {
                        user.state = states_1.STATE_NORMAL;
                        return bot.telegram.sendMessage(chatId, 'Ожидалась оценка.\nПопробуйте ещё раз, используя команду /count_marks', {
                            reply_markup: {
                                remove_keyboard: true
                            }
                        });
                    }
                    // case where grade was sent
                    user.marks.push(Number(textLC));
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
                    await bot.telegram.sendMessage(chatId, `Ваши оценки: ${user.marks.join(', ')}\nВаш средний бал: ${user.gpa}`, wannaUpBtn);
                }
                catch (e) {
                    user.state = states_1.STATE_NORMAL;
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
                    function showEvent(event, timeout) {
                        return new Promise(r => {
                            setTimeout(() => {
                                r(bot.telegram.sendMessage(chatId, event));
                            }, timeout);
                        });
                    }
                    await (async () => {
                        for (let i = 0; i < events.length; i++) {
                            // await showEvent(events[i], i === 0 ? 0 : 700)
                            await showEvent(events[i], 0);
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
        else if (textLC === '/library') {
            (async () => {
                try {
                    const kbd = {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: "ЦЭКО",
                                        callback_data: "library;ceko;"
                                    }
                                ]
                            ]
                        }
                    };
                    return bot.telegram.sendMessage(chatId, `Доступные ресурсы:`, kbd);
                }
                catch (e) {
                    await handleAnError({ e, chatId });
                }
            })();
            return;
        }
        else if (textLC === 'не спишь?') {
            await (async () => {
                try {
                    await bot.telegram.sendMessage(chatId, 'Если бы...');
                    await bot.telegram.sendSticker(chatId, stickers_1.default.insomnia);
                }
                catch (e) {
                    await handleAnError({ e, chatId });
                }
            })();
            return 1;
        }
        return bot.telegram.sendMessage(chatId, `Я вас не понимаю.`);
    }
    catch (e) {
        console.error(e);
    }
});
bot.on('callback_query', async (msg) => {
    //@ts-ignore
    const chatId = msg.chat.id;
    //@ts-ignore
    const data = msg.callbackQuery.data;
    //@ts-ignore
    const newUserData = takeUser(msg.from.id);
    const user = users[newUserData[0]];
    if (data === 'wanna_up') {
        await (async () => {
            try {
                //если нажал на кнопку "не устраивает"
                user.state = states_1.STATE_NORMAL;
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
                let wannaButtons = user.wannaVariants.map(el => ({
                    text: String(el),
                    callback_data: `wanna_${el}`
                }));
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
    else if (data.includes('wanna_') && data !== 'wanna_up') {
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
                await bot.telegram.sendMessage(chatId, `Для этого вам нужно получить ${needStr}`, {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
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
                if (user.users_letter !== null) {
                    await bot.telegram.sendMessage(chatId, `Ваш класс: ${user.users_grade}-${user.users_letter.toUpperCase()}`);
                    await finishClassRecieving(chatId);
                    return 1;
                }
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
                if (user.users_grade !== null) {
                    await bot.telegram.sendMessage(chatId, `Ваш класс: ${user.users_grade}-${user.users_letter.toUpperCase()}`);
                    await finishClassRecieving(chatId);
                    return 1;
                }
                return bot.telegram.sendMessage(chatId, `В каком вы классе?`, class_grade_keys);
            }
            catch (e) {
                await handleAnError({ e, chatId });
            }
        })();
    }
    else if (data.slice(0, "library;".length) === "library;") {
        if (data === "library;") {
            try {
                const kbd = {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "ЦЭКО",
                                    callback_data: "library;ceko;"
                                }
                            ]
                        ]
                    }
                };
                return bot.telegram.sendMessage(chatId, `Доступные ресурсы:`, kbd);
            }
            catch (e) {
                await handleAnError({ e, chatId });
            }
        }
        else {
            let deepData = data.replace("library;", "");
            if (deepData.slice(0, "ceko;".length) === "ceko;") {
                if (deepData === "ceko;") {
                    try {
                        const kbd = {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        {
                                            text: "Математика",
                                            callback_data: "library;ceko;math;"
                                        }
                                    ],
                                    [
                                        {
                                            text: "⏪ Сменить ресурс",
                                            callback_data: "library;"
                                        }
                                    ]
                                ]
                            }
                        };
                        return bot.telegram.sendMessage(chatId, `Выберете предмет:`, kbd);
                    }
                    catch (e) {
                        await handleAnError({ e, chatId });
                    }
                }
                else {
                    deepData = deepData.replace("ceko;", "");
                    if (deepData.slice(0, "math;".length) === "math;") {
                        if (deepData === "math;") {
                            try {
                                const kbd = generate_1.default.GridInt(21, 4, "library;ceko;math;");
                                return bot.telegram.sendMessage(chatId, `Номера доступных заданий:`, kbd);
                            }
                            catch (e) {
                                await handleAnError({ e, chatId });
                            }
                        }
                        else {
                            deepData = deepData.replace("math;", "");
                            let requestingBlock = "";
                            while (deepData[requestingBlock.length] !== ";") {
                                requestingBlock += deepData[requestingBlock.length];
                            }
                            let requestingBlockIndex = Number(requestingBlock);
                            if (isNaN(requestingBlockIndex)) {
                                console.log("wrong task request");
                            }
                            else {
                                let cekoData;
                                const jsonPath = path_1.default.resolve(__dirname, "../src/ceko/assets/ceko/tasks.json");
                                (0, fs_1.readFile)(jsonPath, 'utf-8', (err, data) => {
                                    if (err) {
                                        console.error("failed to read data of tasks");
                                        console.log(err);
                                        return;
                                    }
                                    cekoData = JSON.parse(data);
                                    handle_1.default.TaskQuery(botUrl, chatId, "math;", deepData, requestingBlock + ";", cekoData.MathBlocks[Object.keys(cekoData.MathBlocks)[requestingBlockIndex - 1]]).then(er => {
                                        if (er !== "") {
                                            console.log(err);
                                        }
                                    });
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    return 1;
});
bot.launch();
