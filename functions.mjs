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

function when_school_bell(pares, now) {
    // now format: "09.42"
    // timetable format: [ ["08.30", "09.30"], [...], [...], [...] ]
    const todayDay = moment().format('dddd').toLowerCase();
    // если пара идет сейчас и сейчас будний
    for (const i in pares) {
        if (
            !['sunday', 'saturday'].includes(todayDay) &&
            moment(now, 'H:mm').unix() >= moment(pares[i][0], 'H:mm').unix() &&
            moment(now, 'H:mm').unix() < moment(pares[i][1], 'H:mm').unix()
        ) {
            console.log('now is lesson')
            return `через ${
                moment(moment(pares[i][1], 'H:mm').unix() - moment(now, 'H:mm').unix(), 'unix')
                    .format('mm')
            }мин.`;
        }
    }
    // если уже уроки закончились
    if (moment(now, 'H:mm').unix() > moment(pares[pares.length - 1][1], 'H:mm').unix()) {
        console.log('chill')
        let weekend = 1;
        if(todayDay === 'friday')
            weekend = 3
        else if(todayDay === 'saturday')
            weekend = 2
        // console.log(moment(pares[0][0], 'H.mm').add(1, 'days').format('DD, HH.mm.ss'))
        // console.log(moment(now, 'H.mm').format('DD, HH.mm.ss'));
        const hoursTo = moment(pares[0][0], 'H:mm').add(weekend, 'days')
            .diff(moment(now, 'H:mm'), 'hours');
        const minTo = moment(pares[0][0], 'H:mm').add(weekend, 'days').subtract(hoursTo, 'hours')
            .diff(moment(now, 'H:mm'), 'minutes');
        return `через ${hoursTo}ч. ${minTo}мин.`
    }
    // если сейчас перемена
    for (let i = 1; i < pares.length - 2; i++) {
        if (
            moment(now, 'H:mm').unix() >= moment(pares[i - 1][1], 'H:mm').unix() &&
            moment(now, 'H:mm').unix() < moment(pares[i][0], 'H:mm').unix()
        ) {
            console.log('перемена');
            return `через ${
                moment(
                    moment(pares[i][0], 'H:mm').unix() - moment(now, 'H:mm').unix(),
                    'unix'
                )
                    .format('mm')
            }мин.`
        }
    }
}

const obj = {
    valid_class: valid_class,
    when_school_bell: when_school_bell
}
export default obj

