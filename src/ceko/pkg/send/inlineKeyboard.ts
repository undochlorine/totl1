import { BotMessageWithInlineKeyboard, InlineKeyboardMarkup } from '../../types'

async function InlineKeyboard(botUrl: string, chatId: number, message: string, kbd: InlineKeyboardMarkup): Promise<void> {
	const messageToSend: BotMessageWithInlineKeyboard = {
		chat_id: chatId,
		text: message,
		reply_markup: kbd,
	};

	const response = await fetch(`${botUrl}/sendMessage`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(messageToSend),
	});
}

export default {
	InlineKeyboard
}