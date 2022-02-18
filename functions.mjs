import moment from "moment";

const alphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
const alphabetArray = alphabet.split('');
const validClassLetters = ['а', 'б', 'в', 'г', 'д', 'е'];
const WRONG_NUMBER = 'wrong number';
const WRONG_LETTER = 'wrong letter'

function valid_class(clas) {
    let alph = alphabet;
    let alphArray = alphabetArray;
    let i, j;
    let thereareletter = Boolean(false);
    alphArray.forEach((letter) => {
        if (clas.includes(letter)) thereareletter = true;
    });
    if (!thereareletter)
        return [null, null];
    for (i = 0; i < clas.length; i++) {
        if (isNaN(Number(clas.charAt(i)))) break;
    }
    let users_grade = clas.slice(0, i);
    let users_letter = '';
    clas = clas.slice(i);

    //убираем тире и всё такое
    while (clas !== '') {
        // console.log(`был clas: ${clas}`);
        if (!alph.includes(clas[clas.length - 1])) {
            // console.log('break');
            break;
        } else {
            // console.log(`был ul: ${users_letter}`);
            users_letter += clas[clas.length - 1];
            // console.log(`стал ul: ${users_letter}`);
            clas = clas.slice(0, (clas.length - 1));
            // console.log(`стал clas: ${clas}`);
        }
    }
    users_letter = users_letter.split('');
    users_letter = users_letter.reverse();
    users_letter = users_letter.join('');
    // console.log([users_grade, users_letter]);
    if ((users_grade === '') || (users_letter === '')) {
        return [null, null];
    } else if (users_letter.length > 1 || (!validClassLetters.includes(users_letter))) {
        return [null, WRONG_LETTER]
    } else if (Number(users_grade) > 11 || Number(users_grade) < 8) {
        return [WRONG_NUMBER, null];
    } else {
        return [users_grade, users_letter];
    }
}

function when_school_bell(pares, week, timetable, lessons=4) {
    const now = moment().format('H:m');
    // now format: "09.42"
    // timetable format: [ ["08.30", "09.30"], [...], [...], [...] ]
    timetable.length = lessons;
    const todayDay = moment().format('dddd').toLowerCase();
    // если пара идет сейчас и сейчас рабочий
    for (const i in timetable) {
        if (
            pares !== null &&
            moment(now, 'H:m').unix() >= moment(timetable[i][0], 'H:m').unix() &&
            moment(now, 'H:m').unix() < moment(timetable[i][1], 'H:m').unix()
        ) {
            let minTo = moment(timetable[i][1], 'H:m').subtract(
                moment().format('m'), 'minutes'
            ).format('m');
            let hoursTo = moment(timetable[i][1], 'H:m').subtract({
                'hours': moment().format('H'),
                'minutes': minTo
            }).format('H');

            if(hoursTo == 0)
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
        let maxWeekend = 0;

        let allPares = Object.values(week);
        // let allDays = Object.keys(week);
        let freeDays = []; // 1 - weekend, 0 - workday
        for (let i in allPares) {
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
            for(let i = moment().format('d') - 1; i < freeDays.length; i++) {
                if(freeDays[i] == 0 && i !== moment().format('d') - 1) {
                    maxWeekend = i - ( moment().format('d') - 1 );
                    break;
                }
            }
        }

        const hoursTo = moment(timetable[0][0], 'H:m').add(maxWeekend, 'days')
            .diff(moment(now, 'H:m'), 'hours');
        const minTo = moment(timetable[0][0], 'H:m').add(maxWeekend, 'days').subtract(hoursTo, 'hours')
            .diff(moment(now, 'H:m'), 'minutes');

        if(hoursTo == 0)
            return `Первая пара начнётся через ${minTo}мин`
        else
            return `Первая пара начнётся через ${hoursTo}ч. ${minTo}мин`
    }
    // если сейчас перемена
    for (let i = 1; i < timetable.length; i++) {
        if (
            pares !== null,
            moment(now, 'H:m').unix() >= moment(timetable[i - 1][1], 'H:m').unix() &&
            moment(now, 'H:m').unix() < moment(timetable[i][0], 'H:m').unix()
        ) {
            let rest = moment(timetable[i][0], 'H:m').diff(moment(now, 'H:m'), 'seconds');
            // Расчёт на то, что перемена не больше часа
            let minTo = moment(rest, 'X').format('m');

            return `Перемена.\nЗвонок на урок прозвенит через ${minTo}мин`
        }
    }
    return 'Произошла ошибка.'
}

function current_lesson(pares, timetable, lessons) {
    timetable.length = lessons;
    if( pares === null )
        return 'Сегодня уроков нет.';
    let now = moment().format('H:m');
    // если уже уроки закончились
    if (
        moment(now, 'H:m').unix() >= moment(timetable[timetable.length - 1][1], 'H:m').unix() ||
        moment(now, 'H:m').unix() < moment(timetable[0][0], 'H:m').unix()
    ) {
        return 'Сейчас не идет урок.'
    }
    // если сейчас перемена
    for(let i = 1; i < timetable.length; i++) {
        if(
            moment(now, 'H:m').unix() >= moment(timetable[i - 1][1], 'H:m').unix() &&
            moment(now, 'H:m').unix() < moment(timetable[i][0], 'H:m').unix()
        ) {
            return `Сейчас перемена.`
        }
    }
    //если сейчас урок
    for (const i in pares) {
        if (
            moment(now, 'H:m').unix() >= moment(timetable[i][0], 'H:m').unix() &&
            moment(now, 'H:m').unix() < moment(timetable[i][1], 'H:m').unix()
        ) {
            return `Сейчас ${(pares[i]).toLowerCase()}.`;
        }
    }
    return 'Произошла ошибка.'
}

function next_lesson(pares, timetable, lessons) {
    timetable.length = lessons;
    if( pares === null )
        return 'Сегодня уроков нет.';
    let now = moment().format('HH:m');
    // если уже уроки закончились
    if (
        moment(now, 'H:m').unix() >= moment(timetable[timetable.length - 1][1], 'H:m').unix() ||
        moment(now, 'H:m').unix() < moment(timetable[0][0], 'H:m').unix()
    ) {
        return 'Следующий урок отсутствует.'
    }
    // если сейчас перемена
    for(let i = 1; i < timetable.length; i++) {
        if(
            moment(now, 'H:m').unix() >= moment(timetable[i - 1][1], 'H:m').unix() &&
            moment(now, 'H:m').unix() < moment(timetable[i][0], 'H:m').unix()
        ) {
            return `Следующая пара ${(pares[i]).toLowerCase()}.`
        }
    }
    //если сейчас урок
    for (let i = 0; i < pares.length-1; i++) {
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
    valid_class: valid_class,
    when_school_bell: when_school_bell,
    current_lesson: current_lesson,
    next_lesson: next_lesson
}
export default obj

