"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
function when_school_bell(pares, week, timetable) {
    let lessons;
    if (pares !== null)
        lessons = pares.length;
    else
        lessons = 4;
    const now = (0, moment_1.default)().format('H:m');
    // now format: "09.42"
    // timetable format: [ ["08.30", "09.30"], [...], [...], [...] ]
    timetable.length = lessons;
    // если пара идет сейчас и сейчас рабочий
    for (let i = 0; i < timetable.length; i++) {
        if (pares !== null &&
            (0, moment_1.default)(now, 'H:m').unix() >= (0, moment_1.default)(timetable[i][0], 'H:m').unix() &&
            (0, moment_1.default)(now, 'H:m').unix() < (0, moment_1.default)(timetable[i][1], 'H:m').unix()) {
            let minTo = Number((0, moment_1.default)(timetable[i][1], 'H:m').subtract((0, moment_1.default)().format('m'), 'minutes').format('m'));
            let hoursTo = Number((0, moment_1.default)(timetable[i][1], 'H:m').subtract({
                hours: Number((0, moment_1.default)().format('H')),
                minutes: minTo
            }).format('H'));
            if (hoursTo === 0)
                return `Урок.\nЗвонок на перемену прозвенит через ${minTo}мин`;
            else
                return `Урок.\nЗвонок на перемену прозвенит через ${hoursTo}ч. ${minTo}мин`;
        }
    }
    // если уже уроки закончились
    if ((0, moment_1.default)(now, 'H:m').unix() >= (0, moment_1.default)(timetable[timetable.length - 1][1], 'H:m').unix() ||
        (0, moment_1.default)(now, 'H:m').unix() < (0, moment_1.default)(timetable[0][0], 'H:m').unix() ||
        pares === null) {
        let maxWeekend = 0;
        let allPares = Object.values(week);
        // let allDays = Object.keys(week);
        let freeDays = []; // 1 - weekend, 0 - workday
        for (let i = 0; i < allPares.length; i++) {
            if (allPares[i] === null)
                freeDays.push(1);
            else
                freeDays.push(0);
        }
        //множим freeDays
        freeDays = (freeDays + ',' + freeDays).split(',');
        if ((0, moment_1.default)(now, 'H:m').unix() < (0, moment_1.default)(timetable[0][0], 'H:m').unix() && pares !== null)
            maxWeekend = 0;
        else {
            for (let i = Number((0, moment_1.default)().format('d')) - 1; i < freeDays.length; i++) {
                if (Number(freeDays[i]) == 0 && i !== Number((0, moment_1.default)().format('d')) - 1) {
                    maxWeekend = i - (Number((0, moment_1.default)().format('d')) - 1);
                    break;
                }
            }
        }
        const hoursTo = Number((0, moment_1.default)(timetable[0][0], 'H:m').add(maxWeekend, 'days')
            .diff((0, moment_1.default)(now, 'H:m'), 'hours'));
        const minTo = Number((0, moment_1.default)(timetable[0][0], 'H:m').add(maxWeekend, 'days').subtract(hoursTo, 'hours')
            .diff((0, moment_1.default)(now, 'H:m'), 'minutes'));
        if (hoursTo === 0)
            return `Первая пара начнётся через ${minTo}мин`;
        return `Первая пара начнётся через ${hoursTo}ч. ${minTo}мин`;
    }
    // если сейчас перемена
    for (let i = 1; i < timetable.length; i++) {
        if (pares !== null &&
            (0, moment_1.default)(now, 'H:m').unix() >= (0, moment_1.default)(timetable[i - 1][1], 'H:m').unix() &&
            (0, moment_1.default)(now, 'H:m').unix() < (0, moment_1.default)(timetable[i][0], 'H:m').unix()) {
            let rest = Number((0, moment_1.default)(timetable[i][0], 'H:m').diff((0, moment_1.default)(now, 'H:m'), 'seconds'));
            // Расчёт на то, что перемена не больше часа
            let minTo = Number((0, moment_1.default)(rest, 'X').format('m'));
            return `Перемена.\nЗвонок на урок прозвенит через ${minTo}мин`;
        }
    }
    return 'Произошла ошибка.';
}
function current_lesson(pares, timetable) {
    let lessons;
    if (pares !== null)
        lessons = pares.length;
    else
        lessons = 4;
    timetable.length = lessons;
    if (pares === null)
        return 'Сегодня уроков нет.';
    let now = (0, moment_1.default)().format('H:m');
    // если уже уроки закончились
    if ((0, moment_1.default)(now, 'H:m').unix() >= (0, moment_1.default)(timetable[timetable.length - 1][1], 'H:m').unix() ||
        (0, moment_1.default)(now, 'H:m').unix() < (0, moment_1.default)(timetable[0][0], 'H:m').unix()) {
        return 'Сейчас не идет урок.';
    }
    // если сейчас перемена
    for (let i = 1; i < timetable.length; i++) {
        if ((0, moment_1.default)(now, 'H:m').unix() >= (0, moment_1.default)(timetable[i - 1][1], 'H:m').unix() &&
            (0, moment_1.default)(now, 'H:m').unix() < (0, moment_1.default)(timetable[i][0], 'H:m').unix()) {
            return `Сейчас перемена.`;
        }
    }
    //если сейчас урок
    for (let i = 0; i < pares.length; i++) {
        if ((0, moment_1.default)(now, 'H:m').unix() >= (0, moment_1.default)(timetable[i][0], 'H:m').unix() &&
            (0, moment_1.default)(now, 'H:m').unix() < (0, moment_1.default)(timetable[i][1], 'H:m').unix()) {
            return `Сейчас ${(pares[i]).toLowerCase()}.`;
        }
    }
    return 'Произошла ошибка.';
}
function next_lesson(pares, timetable) {
    let lessons;
    if (pares !== null)
        lessons = pares.length;
    else
        lessons = 4;
    timetable.length = lessons;
    if (pares === null)
        return 'Сегодня уроков нет.';
    let now = (0, moment_1.default)().format('HH:m');
    // если уже уроки закончились
    if ((0, moment_1.default)(now, 'H:m').unix() >= (0, moment_1.default)(timetable[timetable.length - 1][1], 'H:m').unix() ||
        (0, moment_1.default)(now, 'H:m').unix() < (0, moment_1.default)(timetable[0][0], 'H:m').unix()) {
        return 'Следующий урок отсутствует.';
    }
    // если сейчас перемена
    for (let i = 1; i < timetable.length; i++) {
        if ((0, moment_1.default)(now, 'H:m').unix() >= (0, moment_1.default)(timetable[i - 1][1], 'H:m').unix() &&
            (0, moment_1.default)(now, 'H:m').unix() < (0, moment_1.default)(timetable[i][0], 'H:m').unix()) {
            return `Следующая пара ${(pares[i]).toLowerCase()}.`;
        }
    }
    //если сейчас урок
    for (let i = 0; i < pares.length - 1; i++) {
        if ((0, moment_1.default)(now, 'H:m').unix() >= (0, moment_1.default)(timetable[i][0], 'H:m').unix() &&
            (0, moment_1.default)(now, 'H:m').unix() < (0, moment_1.default)(timetable[i][1], 'H:m').unix()) {
            return `Следующая пара ${pares[i + 1].toLowerCase()}.`;
        }
    }
    return `Сейчас последняя пара.`;
}
const obj = {
    when_school_bell,
    current_lesson,
    next_lesson
};
exports.default = obj;
