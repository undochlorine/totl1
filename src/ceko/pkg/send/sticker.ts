import { BotSticker } from '../../types'
import get from '../service/get/randomSticker'

async function Sticker(botUrl: string, update: any): Promise<void> {
	const botSticker: BotSticker = {
		chat_id: update.message.chat.id,
		sticker: get.RandomSticker()
	}

	const response = await fetch(`${botUrl}/sendSticker`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(botSticker),
	});
}

export default {
	Sticker
}