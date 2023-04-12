import axios from 'axios';
import { BotMessageWithInlineKeyboard } from '../../types'
import types from '../../../declaration/interfaces'

async function InlineKeyboard(botUrl: string, chatId: number, message: string, kbd: types.IMarkup): Promise<void> {
	const messageToSend: BotMessageWithInlineKeyboard = {
		chat_id: chatId,
		text: message,
		reply_markup: kbd.reply_markup,
	};

	const response = await axios.post(`${botUrl}/sendMessage`, messageToSend, {
      headers: {
			'Content-Type': 'application/json',
      },
   });
}

export default {
	InlineKeyboard
}