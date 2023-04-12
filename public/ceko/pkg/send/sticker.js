"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const randomSticker_1 = __importDefault(require("../service/get/randomSticker"));
async function Sticker(botUrl, update) {
    const botSticker = {
        chat_id: update.message.chat.id,
        sticker: randomSticker_1.default.RandomSticker()
    };
    const response = await axios_1.default.post(`${botUrl}/sendSticker`, botSticker, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
exports.default = {
    Sticker
};
