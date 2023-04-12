export type InlineKeyboardButton = {
	text: string
	callback_data: string
}

export type InlineKeyboardMarkup = {
	inline_keyboard: InlineKeyboardButton[][]
}

export type BotMessage = {
	chat_id: number,
	text: string
}

export type BotMessageWithInlineKeyboard = {
	chat_id: number,
	text: string,
	reply_markup: InlineKeyboardMarkup
}

export type BotPhoto = {
	chat_id: number,
	photo: string
}

export type BotSticker = {
	chat_id: number,
	sticker: string
}