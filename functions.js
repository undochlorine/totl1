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
		if ( isNaN( Number( clas.charAt(i) ) ) ) break;
	}
	users_grade = clas.slice(0, i);
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

module.exports = {
	valid_class: valid_class
}

