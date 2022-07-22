import {SchoolDay, InlineKeyboard, TimetableForDay} from "./types";

export interface Week {
    "monday": SchoolDay,
    "tuesday": SchoolDay,
    "wednesday": SchoolDay,
    "thursday": SchoolDay,
    "friday": SchoolDay,
    "saturday": SchoolDay,
    "sunday": SchoolDay
}
export interface User {
    id: number,
    users_letter: null | string,
    users_grade: null | number,
    gpa: undefined | number,
    wannaVariants: undefined | number[],
    marks: number[],
    marksMgsId: undefined | number
}
export interface ErrorAction {
    path?: string,
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
export interface Markup {
    reply_markup: ReplyMarkup
}