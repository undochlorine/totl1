import { BotMessage } from '../../types'

async function Message(botUrl: string, chatId: number, message: string): Promise<void> {
	const messageToSend: BotMessage = {
		chat_id: chatId,
		text: message
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
	Message
}