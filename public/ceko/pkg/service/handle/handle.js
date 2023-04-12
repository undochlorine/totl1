"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generate_1 = __importDefault(require("../generate/generate"));
const find_1 = __importDefault(require("../find/find"));
const inlineKeyboard_1 = __importDefault(require("../../send/inlineKeyboard"));
const message_1 = __importDefault(require("../../send/message"));
const photo_1 = __importDefault(require("../../send/photo"));
const sticker_1 = __importDefault(require("../../send/sticker"));
const send = Object.assign(Object.assign(Object.assign(Object.assign({}, inlineKeyboard_1.default), message_1.default), photo_1.default), sticker_1.default);
async function TaskQuery(botUrl, chatId, subject, deepData, blockWithPostfix, block) {
    if (deepData === blockWithPostfix) {
        let kbd = generate_1.default.GridIntervalString(block, 3, "library;ceko;" + subject + blockWithPostfix);
        kbd.reply_markup.inline_keyboard = [
            ...kbd.reply_markup.inline_keyboard,
            [
                {
                    text: "⏪ Сменить задание",
                    callback_data: "library;ceko;" + subject,
                }
            ]
        ];
        send.InlineKeyboard(botUrl, chatId, "Номер упражнения:", kbd);
    }
    else {
        deepData = deepData.replaceAll(blockWithPostfix, "");
        let taskIndex;
        let findErr;
        [taskIndex, findErr] = find_1.default.Interval(block, deepData.slice(0, deepData.length - 1));
        if (findErr !== "") {
            return findErr;
        }
        else if (taskIndex === -1) {
            return "Unknown callback query of task";
        }
        else {
            let urlBatchToSend = [
                block[taskIndex][2]
            ];
            if (taskIndex !== 0) {
                urlBatchToSend = [
                    block[taskIndex - 1][2],
                    ...urlBatchToSend
                ];
            }
            if (taskIndex !== block.length - 1) {
                urlBatchToSend = [
                    ...urlBatchToSend,
                    block[taskIndex + 1][2]
                ];
            }
            await send.Message(botUrl, chatId, "Вот выбранное упражнение и соседние с ним:");
            await send.PhotosGroup(botUrl, chatId, urlBatchToSend);
            let kbd = generate_1.default.GridIntervalString(block, 3, "library;ceko;" + subject + blockWithPostfix);
            kbd.reply_markup.inline_keyboard = [
                ...kbd.reply_markup.inline_keyboard,
                [
                    {
                        text: "⏪ Сменить задание",
                        callback_data: "library;ceko;" + subject
                    }
                ]
            ];
            await send.InlineKeyboard(botUrl, chatId, "Упражнение выполнено? Выберите следующее:", kbd);
        }
    }
    return "";
}
exports.default = {
    TaskQuery
};
