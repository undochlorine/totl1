module.exports = {
	valid_class: function (clas) {
		let alph = 'abcdefghijklmnopqrstuvwxyz';
		let i, j;
		for (i = 0; i < clas.length; i++) {
			if ( isNaN( Number( clas.charAt(i) ) ) ) break;
		}
		users_grade = clas.slice(0, i);
	
		clas = clas.slice(i); // console.log(`clas = ${clas}`);
	
		for (j = 0; j < clas.length; j++) {
			if (!alph.includes(clas[j])) break;
		}
		let users_letter = clas.slice(0, j);
		// console.log(`letter = ${users_letter}, ${users_letter === ''}`);
		while (users_letter === '') {
			clas = clas.slice(1);
			for (j = 0; j < clas.length; j++) {
				if (!alph.includes(clas[j])) break;
			}
			// console.log(`j = ${j}`);
			users_letter = clas.slice(0, j);
		}
		if ((users_grade !== '') && (users_letter !== '')) {
			return [users_grade, users_letter];
		} else {
			return [null, null];
		}
	}
}

