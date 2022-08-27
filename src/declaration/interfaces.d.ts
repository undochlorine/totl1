import {InlineKeyboard, TimetableForDay} from "./types";

export interface Week {
    "monday": TimetableForDay,
    "tuesday": TimetableForDay,
    "wednesday": TimetableForDay,
    "thursday": TimetableForDay,
    "friday": TimetableForDay,
    "saturday": TimetableForDay,
    "sunday": TimetableForDay
}
export interface User {
    id: number,
    users_letter: null | string,
    users_grade: null | number,
    gpa: undefined | number,
    wannaVariants: undefined | number[],
    marks: number[]
}
export interface ErrorAction {
    chatId: number,
    e: any
}
export interface MarkupItem {
    text: string,
    callback_data: string
}
export interface ReplyMarkup {
    inline_keyboard: InlineKeyboard
}
export interface IMarkup {
    reply_markup: ReplyMarkup
}