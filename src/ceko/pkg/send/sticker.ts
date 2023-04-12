import axios from 'axios'
import { BotSticker } from '../../types'
import get from '../service/get/randomSticker'

async function Sticker(botUrl: string, update: any): Promise<void> {
	const botSticker: BotSticker = {
		chat_id: update.message.chat.id,
		sticker: get.RandomSticker()
	}

	const response = await axios.post(`${botUrl}/sendSticker`, botSticker, {
      headers: {
			'Content-Type': 'application/json',
      },
   });
}

export default {
	Sticker
}