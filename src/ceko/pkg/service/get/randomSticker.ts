import * as fs from 'fs';
import * as path from 'path'

// const stickersPath = path.join(__dirname, '../../../ceko/assets/stickers/stickers.json');
const stickersPath = path.join(__dirname, '../../../../../src/ceko/assets/stickers/stickers.json');

let stickersData: { Stickers: string[] };

fs.readFile(stickersPath, 'utf-8', (err, data) => {
	if (err) {
		console.error("failed to read stickers");
		return;
	}
	stickersData = JSON.parse(data);
});

function RandomSticker(): string {
	let i = Math.floor(Math.random() * stickersData.Stickers.length);
	return stickersData.Stickers[i];
}

export default {
	RandomSticker
}