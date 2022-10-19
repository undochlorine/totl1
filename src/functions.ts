import moment from "moment-timezone";
import {Week} from "./declaration/interfaces";
import {TimetableForDay} from "./declaration/types";

moment.tz.setDefault('Europe/Chisinau')

function when_school_bell(
        pares: TimetableForDay,
        week: Week,
        timetable: string[][]
    ): string {
    let lessons: number;
    if(pares !== null)
        lessons = pares.length
    else
        lessons = 4
    const now: string = moment().format('H:m');
    // now format: "09.42"
    // timetable format: [ ["08.30", "09.30"], [...], [...], [...] ]
    timetable.length = lessons;
    // если пара идет сейчас и сейчас рабочий
    for (let i: number = 0; i < timetable.length; i++) {
        if (
            pares !== null &&
            moment(now, 'H:m').unix() >= moment(timetable[i][0], 'H:m').unix() &&
            moment(now, 'H:m').unix() < moment(timetable[i][1], 'H:m').unix()
        ) {
            let minTo: number = Number( moment(timetable[i][1], 'H:m').subtract(
                moment().format('m'), 'minutes'
            ).format('m') );
            let hoursTo: number = Number(moment(timetable[i][1], 'H:m').subtract({
                hours: Number( moment().format('H') ),
                minutes: minTo
            }).format('H'));

            if(hoursTo === 0)
                return `Урок.\nЗвонок на перемену прозвенит через ${minTo}мин`
            else
                return `Урок.\nЗвонок на перемену прозвенит через ${hoursTo}ч. ${minTo}мин`;
        }
    }
    // если уже уроки закончились
    if (
        moment(now, 'H:m').unix() >= moment(timetable[timetable.length - 1][1], 'H:m').unix() ||
        moment(now, 'H:m').unix() < moment(timetable[0][0], 'H:m').unix() ||
        pares === null
    ) {
        let maxWeekend: number = 0;

        let allPares: string[] = Object.values(week);
        // let allDays = Object.keys(week);
        let freeDays: any = []; // 1 - weekend, 0 - workday
        for (let i: number = 0; i < allPares.length; i++) {
            if(allPares[i] === null)
                freeDays.push(1);
            else
                freeDays.push(0);
        }
        //множим freeDays
        freeDays = (freeDays + ',' + freeDays).split(',')

        if (moment(now, 'H:m').unix() < moment(timetable[0][0], 'H:m').unix() && pares !== null)
            maxWeekend = 0
        else {
            for(let i: number = Number(moment().format('d')) - 1; i < freeDays.length; i++) {
                if(Number(freeDays[i]) == 0 && i !== Number(moment().format('d')) - 1) {
                    maxWeekend = i - ( Number(moment().format('d')) - 1 );
                    break;
                }
            }
        }

        const hoursTo: number = Number(moment(timetable[0][0], 'H:m').add(maxWeekend, 'days')
            .diff(moment(now, 'H:m'), 'hours'));
        const minTo: number = Number(moment(timetable[0][0], 'H:m').add(maxWeekend, 'days').subtract(hoursTo, 'hours')
            .diff(moment(now, 'H:m'), 'minutes'));

        if(hoursTo === 0)
            return `Первая пара начнётся через ${minTo}мин`
        return `Первая пара начнётся через ${hoursTo}ч. ${minTo}мин`
    }
    // если сейчас перемена
    for (let i: number = 1; i < timetable.length; i++) {
        if (
            pares !== null &&
            moment(now, 'H:m').unix() >= moment(timetable[i - 1][1], 'H:m').unix() &&
            moment(now, 'H:m').unix() < moment(timetable[i][0], 'H:m').unix()
        ) {
            let rest: number = Number(moment(timetable[i][0], 'H:m').diff(moment(now, 'H:m'), 'seconds'));
            // Расчёт на то, что перемена не больше часа
            let minTo: number = Number(moment(rest, 'X').format('m'));

            return `Перемена.\nЗвонок на урок прозвенит через ${minTo}мин`
        }
    }
    return 'Произошла ошибка.'
}

function current_lesson(
        pares: TimetableForDay,
        timetable: string[][]
    ): string {
    let lessons: number;
    if(pares !== null)
        lessons = pares.length
    else
        lessons = 4
    timetable.length = lessons;
    if( pares === null )
        return 'Сегодня уроков нет.';
    let now: string = moment().format('H:m');
    // если уже уроки закончились
    if (
        moment(now, 'H:m').unix() >= moment(timetable[timetable.length - 1][1], 'H:m').unix() ||
        moment(now, 'H:m').unix() < moment(timetable[0][0], 'H:m').unix()
    ) {
        return 'Сейчас не идет урок.'
    }
    // если сейчас перемена
    for(let i: number = 1; i < timetable.length; i++) {
        if(
            moment(now, 'H:m').unix() >= moment(timetable[i - 1][1], 'H:m').unix() &&
            moment(now, 'H:m').unix() < moment(timetable[i][0], 'H:m').unix()
        ) {
            return `Сейчас перемена.`
        }
    }
    //если сейчас урок
    for (let i: number = 0; i < pares.length; i++) {
        if (
            moment(now, 'H:m').unix() >= moment(timetable[i][0], 'H:m').unix() &&
            moment(now, 'H:m').unix() < moment(timetable[i][1], 'H:m').unix()
        ) {
            return `Сейчас ${(pares[i]).toLowerCase()}.`;
        }
    }
    return 'Произошла ошибка.'
}

function next_lesson(
    pares: TimetableForDay,
    timetable: string[][]
): string {
    let lessons: number;
    if(pares !== null)
        lessons = pares.length
    else
        lessons = 4
    timetable.length = lessons;
    if( pares === null )
        return 'Сегодня уроков нет.';
    let now: string = moment().format('HH:m');
    // если уже уроки закончились
    if (
        moment(now, 'H:m').unix() >= moment(timetable[timetable.length - 1][1], 'H:m').unix() ||
        moment(now, 'H:m').unix() < moment(timetable[0][0], 'H:m').unix()
    ) {
        return 'Следующий урок отсутствует.'
    }
    // если сейчас перемена
    for(let i: number = 1; i < timetable.length; i++) {
        if(
            moment(now, 'H:m').unix() >= moment(timetable[i - 1][1], 'H:m').unix() &&
            moment(now, 'H:m').unix() < moment(timetable[i][0], 'H:m').unix()
        ) {
            return `Следующая пара ${(pares[i]).toLowerCase()}.`
        }
    }
    //если сейчас урок
    for (let i: number = 0; i < pares.length-1; i++) {
        if (
            moment(now, 'H:m').unix() >= moment(timetable[i][0], 'H:m').unix() &&
            moment(now, 'H:m').unix() < moment(timetable[i][1], 'H:m').unix()
        ) {
           return `Следующая пара ${ pares[i+1].toLowerCase()}.`;
        }
    }
    return `Сейчас последняя пара.`
}

const obj = {
    when_school_bell,
    current_lesson,
    next_lesson
}
export default obj

