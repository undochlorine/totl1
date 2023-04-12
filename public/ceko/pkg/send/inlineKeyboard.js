"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function InlineKeyboard(botUrl, chatId, message, kbd) {
    const messageToSend = {
        chat_id: chatId,
        text: message,
        reply_markup: kbd.reply_markup,
    };
    const response = await axios_1.default.post(`${botUrl}/sendMessage`, messageToSend, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
exports.default = {
    InlineKeyboard
};
