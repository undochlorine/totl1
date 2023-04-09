export type InlineKeyboardButton = {
	text: string
	callback_data: string
}

export type InlineKeyboardMarkup = {
	inline_keyboard: InlineKeyboardButton[][]
}