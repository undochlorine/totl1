import generate from '../generate/generate'
import find from '../find/find'
import types from '../../../types'

// todo: remove the mock
const send: any = {}

function TaskQuery(botUrl: string, chatId: number, subject, deepData, blockWithPostfix: string, block: string[][]): string {
	if (deepData === blockWithPostfix) {
		let kbd = generate.GridIntervalString(block, 3, "library;ceko;" + subject + blockWithPostfix)
		kbd.inline_keyboard = [
			...kbd.inline_keyboard,
			[
				{
					text: "⏪ Сменить задание",
					callback_data: "library;ceko;" + subject,
				}
			] as types.InlineKeyboardButton[]
		]
		let err = send.InlineKeyboard(botUrl, chatId, "Номер упражнения:", kbd)
		if (err !== "") {
			return err
		}
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
			let err = send.Message(botUrl, chatId, "Вот выбранное упражнение и соседние с ним:")
			if (err !== "") {
				return err
			}
			let kbd = generate.GridIntervalString(block, 3, "library;ceko;" + subject + blockWithPostfix)
			kbd.inline_keyboard = [
				...kbd.inline_keyboard,
				[
					{
						text: "⏪ Сменить задание",
						callback_data: "library;ceko;" + subject
					}
				] as types.InlineKeyboardButton[]
			]
			err = send.InlineKeyboard(botUrl, chatId, "Упражнение выполнено? Выберите следующее:", kbd)
			if (err !== "") {
				return err
			}
		}
	}
	return ""
}