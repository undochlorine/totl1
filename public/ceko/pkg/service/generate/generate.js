"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function GridInt(amountOfBlocks, columns, callbackDataPrefix) {
    let rows;
    let rest = 0;
    if (amountOfBlocks % columns === 0) {
        rows = amountOfBlocks / columns;
    }
    else {
        rows = Math.floor(amountOfBlocks / columns) + 1;
        rest = amountOfBlocks % columns;
    }
    const inlineKeyboard = [];
    for (let i = 0; i < rows; i++) {
        if (i === rows - 1 && rest !== 0) {
            inlineKeyboard[i] = new Array(rest);
        }
        else {
            inlineKeyboard[i] = new Array(columns);
        }
        for (let j = 0; j < columns; j++) {
            if (i === rows - 1 && rest !== 0 && j >= rest) {
                break;
            }
            inlineKeyboard[i][j] = {
                text: `${i * columns + j + 1}`,
                callback_data: `${callbackDataPrefix}${i * columns + j + 1};`
            };
        }
    }
    let callbackDataToGetBack = callbackDataPrefix.slice(0, callbackDataPrefix.length - 1);
    while (true) {
        if (callbackDataToGetBack.length <= 0 || callbackDataToGetBack[callbackDataToGetBack.length - 1] === ";") {
            break;
        }
        callbackDataToGetBack = callbackDataToGetBack.slice(0, callbackDataToGetBack.length - 1);
    }
    inlineKeyboard.push([
        {
            text: "⏪ Сменить предмет",
            callback_data: callbackDataToGetBack
        }
    ]);
    return {
        reply_markup: {
            inline_keyboard: inlineKeyboard
        }
    };
}
function GridIntervalString(interval, columns, callbackDataPrefix) {
    const amountOfBlocks = interval.length;
    let rows;
    let rest = 0;
    if (amountOfBlocks % columns === 0) {
        rows = amountOfBlocks / columns;
    }
    else {
        rows = Math.floor(amountOfBlocks / columns) + 1;
        rest = amountOfBlocks % columns;
    }
    const inlineKeyboard = [];
    for (let i = 0; i < rows; i++) {
        if (i === rows - 1 && rest !== 0) {
            inlineKeyboard[i] = new Array(rest);
        }
        else {
            inlineKeyboard[i] = new Array(columns);
        }
        for (let j = 0; j < columns; j++) {
            if (i === rows - 1 && rest !== 0 && j >= rest) {
                break;
            }
            const currentInterval = `${interval[i * columns + j][0]}-${interval[i * columns + j][1]}`;
            inlineKeyboard[i][j] = {
                text: currentInterval,
                callback_data: `${callbackDataPrefix}${currentInterval};`
            };
        }
    }
    return {
        reply_markup: {
            inline_keyboard: inlineKeyboard
        }
    };
}
exports.default = {
    GridInt,
    GridIntervalString
};
