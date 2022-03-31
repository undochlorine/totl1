import {Telegraf} from 'telegraf';
import functions from './functions.mjs';
import moment from "moment";
import {readFileSync} from "fs";

// const stickers = JSON.parse(readFileSync('./stickers.json'));
const security = JSON.parse(readFileSync('./security.json'));

const bot = new Telegraf(security["TELEGRAM_BOT_TOKEN"]);

let users_letter = null, users_grade = null;
let gpa;
let wannaVariants;
let marks = [];
let marksMgsId;
const marks_keys = {
    reply_markup: {
        inline_keyboard: [
            [
                {text: '1', callback_data: 'mark1'},
                {text: '2', callback_data: 'mark2'}
            ],
            [
                {text: '3', callback_data: 'mark3'},
                {text: '4', callback_data: 'mark4'},
                {text: '5', callback_data: 'mark5'}
            ]
        ]
    }
};
const markNeed = 0.60;
const class_letter_keys = {
    reply_markup: {
        inline_keyboard: [
            [
                {text: 'А', callback_data: 'class_letter_А'},
                {text: 'Б', callback_data: 'class_letter_Б'},
                {text: 'В', callback_data: 'class_letter_В'}
            ],
            [
                {text: 'Г', callback_data: 'class_letter_Г'},
                {text: 'Д', callback_data: 'class_letter_Д'},
                {text: 'Е', callback_data: 'class_letter_Е'}
            ]
        ]
    }
}
const class_grade_keys = {
    reply_markup: {
        inline_keyboard: [
            [
                {text: '8', callback_data: 'class_grade_8'},
                {text: '9', callback_data: 'class_grade_9'},
                {text: '10', callback_data: 'class_grade_10'},
                {text: '11', callback_data: 'class_grade_11'}
            ]
        ]
    }
}

bot.telegram.setMyCommands([
    {command: '/start', description: 'Начать общение с ботом.'},
    {command: '/set_class', description: 'Установить класс.'},
    {command: '/when_school_bell', description: 'Когда звонок?'},
    {command: '/current_lesson', description: 'Какая сейчас пара?'},
    {command: '/next_lesson', description: 'Какая следующая пара?'},
    {command: '/timetable_today', description: 'Расписание на сегодня.'},
    {command: '/timetable_tomorrow', description: 'Расписание на завтра.'},
    {command: '/count_marks', description: 'Узнать средний бал.'},
    {command: '/events', description: 'Последние события в лицее и в мире.'}
]);

bot.on('message', async ctx => {
    const text = ctx.message.text;
    const textLC = text.toLowerCase(); // textLC - message text in lower case
    const from = ctx.from;
    const chatId = ctx.chat.id;
    if (textLC === '/start') {
        return bot.telegram.sendMessage(
            chatId,
            `Привет, ${from.first_name}! В каком вы классе?`,
            class_grade_keys
        );
    } else if (textLC === '/set_class') {
        return bot.telegram.sendMessage(
            chatId,
            `В каком вы классе?`,
            class_grade_keys
        );
    } else if (
        textLC === '/when_school_bell' ||
        (textLC.includes('когда') &&
            (textLC.includes('урок') || textLC.includes('пара') || textLC.includes('звонок') || textLC.includes('перемена'))
        )
    ) {
        if (users_grade == null || users_letter == null) {
            return bot.telegram.sendMessage(chatId, 'Для начала установите свой класс с помощью команды /set_class')
        } else {
            let json = await readFileSync('./fake_json/lyceum.json');
            json = await JSON.parse(json);
            const todayDay = moment().format('dddd').toLowerCase();
            //current mode of learning(online/offline)
            let current = "offline";
            if(json["stuff"]["timetable"][current]["period"][0] === null && json["stuff"]["timetable"][current]["period"][1] === null)
                current = "online";
            if(json["stuff"]["timetable"]["online"]["period"][0] === null && json["stuff"]["timetable"]["online"]["period"][1] === null)
                current = undefined;

            if (!current)
                return bot.telegram.sendMessage(chatId, 'Извините, у нас нету актуального расписания.');

            let periodStart = moment(json["stuff"]["timetable"][current]["period"][0], 'DD.MM.YYYY')
                .unix();
            let periodEnd = moment(json["stuff"]["timetable"][current]["period"][1], 'DD.MM.YYYY')
                .unix();
            let today = moment(
                `${moment().format('DD')}/${moment().format('MM')}/${moment().format('YYYY')}`,
                'DD/MM/YYYY'
            ).unix();
            //проверяем расписание на актуальность

            if(
                (Number.isNaN( periodStart ) && !Number.isNaN( periodEnd ) && today > periodEnd) ||
                (!Number.isNaN( periodStart ) && !Number.isNaN( periodEnd ) && !(today > periodStart && today < periodEnd) ) ||
                (Number.isNaN( periodEnd ) && !Number.isNaN( periodStart ) && today < periodStart)
            ) {
                if(current === "offline")
                    current = "online"
                else
                    current = "offline";
                periodStart = moment(json["stuff"]["timetable"][current]["period"][0], 'DD.MM.YYYY')
                    .unix();
                periodEnd = moment(json["stuff"]["timetable"][current]["period"][1], 'DD.MM.YYYY')
                    .unix();
            }

            if(
                (!Number.isNaN( periodEnd ) && today > periodEnd) ||
                (!Number.isNaN( periodStart ) && today < periodStart)
            )
                return bot.telegram.sendMessage(chatId, 'У нас отсутствует акуальное расписание, попробуйте позже.')
            else if(
                (!Number.isNaN( periodEnd ) && today <= periodEnd && Number.isNaN( periodStart )) ||
                (!Number.isNaN( periodStart ) && !Number.isNaN( periodEnd ) && today >= periodStart && today <= periodEnd) ||
                (!Number.isNaN( periodStart ) && today >= periodStart && Number.isNaN( periodEnd ))
            ) {
                let amountLessons;
                if (json["classes"][users_grade][users_letter]["lessons"][todayDay] === null)
                    amountLessons = 4
                else
                    amountLessons = json["classes"][users_grade][users_letter]["lessons"][todayDay].length
                let bell = functions.when_school_bell(
                    json["classes"][users_grade][users_letter]["lessons"][todayDay],
                    json["classes"][users_grade][users_letter]["lessons"],
                    json["stuff"]["timetable"][current]["pares"],
                    amountLessons
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
            let json = await readFileSync('./fake_json/lyceum.json');
            json = await JSON.parse(json);
            let todayDay = moment().format('dddd').toLowerCase()
            let timetable = json["classes"][users_grade][users_letter]["lessons"][todayDay];
            if (timetable == null)
                return bot.telegram.sendMessage(chatId, 'Сегодня уроков нет.')
            else
                return bot.telegram.sendMessage(chatId, `Расписание на сегодня:\n${timetable.map((el, index) => `${index + 1}. ${el}`).join('\n')}`);
        }
    } else if (
        textLC === '/timetable_tomorrow' ||
        (textLC.includes('завтра') && (textLC.includes('расписание') || textLC.includes('уроки') || textLC.includes('пары')))
    ) {
        if (users_grade == null || users_letter == null) {
            return bot.telegram.sendMessage(chatId, 'Для начала установите свой класс с помощью команды /set_class')
        } else {
            let json = await readFileSync('./fake_json/lyceum.json');
            json = await JSON.parse(json);
            let tomorrowDay = moment().add(1, 'days').format('dddd').toLowerCase()
            let timetable = json["classes"][users_grade][users_letter]["lessons"][tomorrowDay];
            if (timetable == null)
                return bot.telegram.sendMessage(chatId, 'Завтра уроков нет.')
            else
                return bot.telegram.sendMessage(chatId, `Расписание на завтра:\n${timetable.map((el, index) => `${index + 1}. ${el}`).join('\n')}`);
        }
    } else if (
        textLC === '/current_lesson' ||
        (textLC.includes('сейчас') && (textLC.includes('пара') || textLC.includes('урок')))
    ) {
        if (users_grade == null || users_letter == null) {
            return bot.telegram.sendMessage(chatId, 'Для начала установите свой класс с помощью команды /set_class')
        } else {
            let json = await readFileSync('./fake_json/lyceum.json');
            json = await JSON.parse(json);
            let lessons = json["classes"][users_grade][users_letter]["lessons"][moment().format('dddd').toLowerCase()];

            const todayDay = moment().format('dddd').toLowerCase();
            //current mode of learning(online/offline)
            let current = "offline";
            if(json["stuff"]["timetable"][current]["period"][0] === null && json["stuff"]["timetable"][current]["period"][1] === null)
                current = "online";
            if(json["stuff"]["timetable"]["online"]["period"][0] === null && json["stuff"]["timetable"]["online"]["period"][1] === null)
                current = undefined;

            if (!current)
                return bot.telegram.sendMessage(chatId, 'Извините, у нас нету актуального расписания.');

            let periodStart = moment(json["stuff"]["timetable"][current]["period"][0], 'DD.MM.YYYY')
                .unix();
            let periodEnd = moment(json["stuff"]["timetable"][current]["period"][1], 'DD.MM.YYYY')
                .unix();
            let today = moment(
                `${moment().format('DD')}/${moment().format('MM')}/${moment().format('YYYY')}`,
                'DD/MM/YYYY'
            ).unix();
            //проверяем расписание на актуальность

            if(
                (Number.isNaN( periodStart ) && !Number.isNaN( periodEnd ) && today > periodEnd) ||
                (!Number.isNaN( periodStart ) && !Number.isNaN( periodEnd ) && !(today > periodStart && today < periodEnd) ) ||
                (Number.isNaN( periodEnd ) && !Number.isNaN( periodStart ) && today < periodStart)
            ) {
                if(current === "offline")
                    current = "online"
                else
                    current = "offline";
                periodStart = moment(json["stuff"]["timetable"][current]["period"][0], 'DD.MM.YYYY')
                    .unix();
                periodEnd = moment(json["stuff"]["timetable"][current]["period"][1], 'DD.MM.YYYY')
                    .unix();
            }

            if(
                (!Number.isNaN( periodEnd ) && today > periodEnd) ||
                (!Number.isNaN( periodStart ) && today < periodStart)
            )
                return bot.telegram.sendMessage(chatId, 'У нас отсутствует акуальное расписание, попробуйте позже.')
            else if(
                (!Number.isNaN( periodEnd ) && today <= periodEnd && Number.isNaN( periodStart )) ||
                (!Number.isNaN( periodStart ) && !Number.isNaN( periodEnd ) && today >= periodStart && today <= periodEnd) ||
                (!Number.isNaN( periodStart ) && today >= periodStart && Number.isNaN( periodEnd ))
            ) {
                let amountLessons;
                if (json["classes"][users_grade][users_letter]["lessons"][todayDay] === null)
                    amountLessons = 4
                else
                    amountLessons = json["classes"][users_grade][users_letter]["lessons"][todayDay].length
                let current_lesson = functions.current_lesson(
                    lessons,
                    json["stuff"]["timetable"][current]["pares"],
                    amountLessons
                );
                return bot.telegram.sendMessage(chatId, `${current_lesson}`);
            } else
                return bot.telegram.sendMessage(chatId, 'Приносим свои извинения.\nРасписание заполнено некоректно.\nПостараемся это исправить в ближайшее время.')
        }
    } else if (
        textLC === '/next_lesson' ||
        (textLC.includes('следующая') && textLC.includes('пара')) ||
        (textLC.includes('следующий') && textLC.includes('урок'))
    ) {
        if (users_grade == null || users_letter == null) {
            return bot.telegram.sendMessage(chatId, 'Для начала установите свой класс с помощью команды /set_class')
        } else {
            let json = await readFileSync('./fake_json/lyceum.json');
            json = await JSON.parse(json);
            let lessons = json["classes"][users_grade][users_letter]["lessons"][moment().format('dddd').toLowerCase()];

            const todayDay = moment().format('dddd').toLowerCase();
            //current mode of learning(online/offline)
            let current = "offline";
            if(json["stuff"]["timetable"][current]["period"][0] === null && json["stuff"]["timetable"][current]["period"][1] === null)
                current = "online";
            if(json["stuff"]["timetable"]["online"]["period"][0] === null && json["stuff"]["timetable"]["online"]["period"][1] === null)
                current = undefined;

            if (!current)
                return bot.telegram.sendMessage(chatId, 'Извините, у нас нету актуального расписания.');

            let periodStart = moment(json["stuff"]["timetable"][current]["period"][0], 'DD.MM.YYYY')
                .unix();
            let periodEnd = moment(json["stuff"]["timetable"][current]["period"][1], 'DD.MM.YYYY')
                .unix();
            let today = moment(
                `${moment().format('DD')}/${moment().format('MM')}/${moment().format('YYYY')}`,
                'DD/MM/YYYY'
            ).unix();
            //проверяем расписание на актуальность

            if(
                (Number.isNaN( periodStart ) && !Number.isNaN( periodEnd ) && today > periodEnd) ||
                (!Number.isNaN( periodStart ) && !Number.isNaN( periodEnd ) && !(today > periodStart && today < periodEnd) ) ||
                (Number.isNaN( periodEnd ) && !Number.isNaN( periodStart ) && today < periodStart)
            ) {
                if(current === "offline")
                    current = "online"
                else
                    current = "offline";
                periodStart = moment(json["stuff"]["timetable"][current]["period"][0], 'DD.MM.YYYY')
                    .unix();
                periodEnd = moment(json["stuff"]["timetable"][current]["period"][1], 'DD.MM.YYYY')
                    .unix();
            }

            if(
                (!Number.isNaN( periodEnd ) && today > periodEnd) ||
                (!Number.isNaN( periodStart ) && today < periodStart)
            )
                return bot.telegram.sendMessage(chatId, 'У нас отсутствует акуальное расписание, попробуйте позже.')
            else if(
                (!Number.isNaN( periodEnd ) && today <= periodEnd && Number.isNaN( periodStart )) ||
                (!Number.isNaN( periodStart ) && !Number.isNaN( periodEnd ) && today >= periodStart && today <= periodEnd) ||
                (!Number.isNaN( periodStart ) && today >= periodStart && Number.isNaN( periodEnd ))
            ) {
                let amountLessons;
                if (json["classes"][users_grade][users_letter]["lessons"][todayDay] === null)
                    amountLessons = 4
                else
                    amountLessons = json["classes"][users_grade][users_letter]["lessons"][todayDay].length
                let current_lesson = functions.next_lesson(
                    lessons,
                    json["stuff"]["timetable"][current]["pares"],
                    amountLessons
                );
                return bot.telegram.sendMessage(chatId, `${current_lesson}`);
            } else
                return bot.telegram.sendMessage(chatId, 'Приносим свои извинения.\nРасписание заполнено некоректно.\nПостараемся это исправить в ближайшее время.')
        }
    } else if (
        textLC === '/count_marks'
    ) {
        marks = [];
        return bot.telegram.sendMessage(chatId, 'Введите свои оценки по определённому предмету:', marks_keys)
    } else if (
        textLC === '/events'
    ) {
        let json = readFileSync('./fake_json/lyceum.json');
        json = await JSON.parse(json);
        let events = json["stuff"]["events"];
        await (async () => {
            for (let i = 0; i < events.length; i++) {
                await bot.telegram.sendMessage(chatId, events[i]);
            }
        })()
        return 1;
    }

    return bot.telegram.sendMessage(chatId, `Я вас не понимаю.`);
});

bot.on('callback_query', async msg => {
    const chatId = msg.chat.id;
    const data = msg.callbackQuery.data;

    // если ввел оценку - добавляем в массив
    if (['mark1', 'mark2', 'mark3', 'mark4', 'mark5'].includes(data)) {
        //добавляем оценку
        marks.push(Number(data.charAt(data.length - 1)));

        let sum = marks.reduce((acc, next) => acc + next);
        gpa = (sum / marks.length).toFixed(2);
        let wannaUpBtn = {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Не устраивает', callback_data: 'wanna_up'}]
                ]
            }
        };
        // если средний бал выше 4.60 то некуда уже подниматься
        if (gpa >= (4 + markNeed))
            wannaUpBtn = {};

        //если это первая вводимая оценка - просто выводим ее
        if (marks[1] === undefined) {
            await bot.telegram.sendMessage(
                chatId,
                `Ваши оценки: ${marks.join(', ')}\nВаш средний бал: ${gpa}`,
                wannaUpBtn
            )
                .then((msgInfo) => {
                    marksMgsId = msgInfo.message_id
                })
        }
        // либо редактируем уже имеющееся сообщение
        else
            await bot.telegram.editMessageText(
                chatId,
                marksMgsId,
                null,
                `Ваши оценки: ${marks.join(', ')}\nВаш средний бал: ${gpa}`,
                wannaUpBtn
            )
    } else if (data === 'wanna_up') {
        //если нажал на кнопку "не устраивает"
        let min;
        //если оценка 3.22 -> предлагаем 4, 5
        //если оценка 3.79 -> предлагаем 5 потому что у него уже есть 4ка
        if (Math.floor(gpa) === Math.floor(gpa - markNeed))
            min = Math.floor(gpa) + 2
        else
            min = Math.floor(gpa) + 1;
        wannaVariants = [];
        for (let i = min; i <= 5; i++) {
            wannaVariants.push(i);
        }
        let wannaButtons = wannaVariants.map(el => ({text: el, callback_data: `wanna_${el}`}));
        await bot.telegram.sendMessage(chatId, 'Какую оценку вы хотите иметь?', {
            reply_markup: {
                inline_keyboard: [
                    wannaButtons
                ]
            }
        })
    } else if (data.includes('wanna_')) {
        //если выбрал какую оценку хочет к примеру 4
        const chosenMark = data.charAt(data.length - 1);
        //chosenMark = 4
        const wannaValue = chosenMark - (1 - markNeed);
        //wannaValue = 3,60
        let min;
        if (Math.floor(gpa) === Math.floor(gpa - markNeed))
            min = Math.floor(gpa) + 2
        else
            min = Math.floor(gpa) + 1;
        let need = {};
        //пробуем все оценки которые ему могут помочь
        for (let i = min; i <= 5; i++) {
            //не портим массив marks
            let localMarks = [...marks];
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
                needStr += `${Object.values(need)[i]} "${Object.keys(need)[i]}"`
            else
                needStr += ` или ${Object.values(need)[i]} "${Object.keys(need)[i]}"`;
        }
        await bot.telegram.sendMessage(chatId, `Для этого вам нужно получить ${needStr}`)
    } else if (data.includes('class_grade_')) {
        users_grade = Number(data.charAt(data.length - 1));
        if (users_grade === 1)
            users_grade = 11
        else if (users_grade === 0)
            users_grade = 10;
        return bot.telegram.sendMessage(
            chatId,
            'Буква вашего класса:',
            class_letter_keys
        )
    } else if (data.includes('class_letter_')) {
        users_letter = data.charAt(data.length - 1).toLowerCase();
        return bot.telegram.sendMessage(chatId, `Ваш класс: ${users_grade}-${users_letter.toUpperCase()}`)
    }

    return 1;
});

bot.launch();