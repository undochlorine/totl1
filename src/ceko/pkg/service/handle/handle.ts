import generate from '../generate/generate'
import find from '../find/find'
import typesCeko from '../../../types'
import typesMain from '../../../../declaration/interfaces'
import sendInlineKeyboard from '../../send/inlineKeyboard'
import sendMessage from '../../send/message'
import sendPhoto from '../../send/photo'
import sendSticker from '../../send/sticker'

const send = {
	...sendInlineKeyboard,
	...sendMessage,
	...sendPhoto,
	...sendSticker
}

async function TaskQuery(botUrl: string, chatId: number, subject: string, deepData: string, blockWithPostfix: string, block: string[][]): Promise<string> {
	if (deepData === blockWithPostfix) {
		let kbd = generate.GridIntervalString(block, 3, "library;ceko;" + subject + blockWithPostfix)
		kbd.reply_markup.inline_keyboard = [
			...kbd.reply_markup.inline_keyboard,
			[
				{
					text: "⏪ Сменить задание",
					callback_data: "library;ceko;" + subject,
				}
			] as typesMain.MarkupItem[]
		]
		send.InlineKeyboard(botUrl, chatId, "Номер упражнения:", kbd)
	} else {
		deepData = deepData.replaceAll(blockWithPostfix, "")
		let taskIndex: number;
		let findErr: string
		[taskIndex, findErr] = find.Interval(block, deepData.slice(0, deepData.length - 1))
		if (findErr !== "") {
			return findErr
		} else if (taskIndex === -1) {
			return "Unknown callback query of task"
		} else {
			let urlBatchToSend = [
				block[taskIndex][2]
			]
			if (taskIndex !== 0) {
				urlBatchToSend = [
					block[taskIndex - 1][2],
					...urlBatchToSend
				]
			}
			if (taskIndex !== block.length - 1) {
				urlBatchToSend = [
					...urlBatchToSend,
					block[taskIndex+1][2]
				]
			}
			await send.Message(botUrl, chatId, "Вот выбранное упражнение и соседние с ним:")
			await send.PhotosGroup(botUrl, chatId, urlBatchToSend)
			let kbd = generate.GridIntervalString(block, 3, "library;ceko;" + subject + blockWithPostfix)
			kbd.reply_markup.inline_keyboard = [
				...kbd.reply_markup.inline_keyboard,
				[
					{
						text: "⏪ Сменить задание",
						callback_data: "library;ceko;" + subject
					}
				] as typesMain.MarkupItem[]
			]
			await send.InlineKeyboard(botUrl, chatId, "Упражнение выполнено? Выберите следующее:", kbd)
		}
	}
	return ""
}

export default {
	TaskQuery
}