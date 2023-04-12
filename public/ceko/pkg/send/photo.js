"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function Photo(botUrl, chatId, url) {
    const botPhoto = {
        chat_id: chatId,
        photo: url
    };
    const response = await axios_1.default.post(`${botUrl}/sendPhoto`, botPhoto, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
async function PhotosGroup(botUrl, chatId, urls) {
    const botPhotos = {
        chat_id: chatId,
        media: []
    };
    for (const u of urls) {
        botPhotos.media.push({
            type: "photo",
            media: u
        });
    }
    const response = await axios_1.default.post(`${botUrl}/sendMediaGroup`, botPhotos, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
exports.default = {
    Photo,
    PhotosGroup
};
