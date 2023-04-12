import axios from 'axios'
import { BotPhoto } from '../../types'

async function Photo(botUrl: string, chatId: number, url: string): Promise<void> {
	const botPhoto: BotPhoto = {
		chat_id: chatId,
		photo: url
	};

	const response = await axios.post(`${botUrl}/sendPhoto`, botPhoto, {
		headers: {
			'Content-Type': 'application/json',
		},
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

	const response = await axios.post(`${botUrl}/sendMediaGroup`, botPhotos, {
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

export default {
	Photo,
	PhotosGroup
}