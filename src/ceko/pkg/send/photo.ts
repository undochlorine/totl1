import { BotPhoto } from '../../types'

async function Photo(botUrl: string, chatId: number, url: string): Promise<void> {
	const botPhoto: BotPhoto = {
		chat_id: chatId,
		photo: url
	};

	const response = await fetch(`${botUrl}/sendPhoto`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(botPhoto),
	});
}

async function PhotosGroup(botUrl: string, chatId: number, urls: string[]): Promise<void> {
	type InputMediaPhoto = {
		type: string,
		media: string
	}

	type BotPhotos = {
		chat_id: number,
		media: InputMediaPhoto[]
	}
	
	const botPhotos: BotPhotos = {
		chat_id: chatId,
		media: []
	};

	for (const u of urls) {
		botPhotos.media.push({
			type: "photo",
			media: u
		})
	}

	const response = await fetch(`${botUrl}/sendMediaGroup`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(botPhotos),
	});
}

export default {
	Photo,
	PhotosGroup
}