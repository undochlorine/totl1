import axios from 'axios'
import { BotMessage } from '../../types'

async function Message(botUrl: string, chatId: number, message: string): Promise<void> {
	const messageToSend: BotMessage = {
		chat_id: chatId,
		text: message
	};

	const response = await axios.post(`${botUrl}/sendMessage`, messageToSend, {
      headers: {
			'Content-Type': 'application/json',
      },
   });
}

export default {
	Message
}