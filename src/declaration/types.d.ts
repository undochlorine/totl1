import {MarkupItem} from "./interfaces";

export type SchoolDay = string[] | null
export type StudyMode = "offline" | "online" | undefined
export type TimetableForDay = string[] | null
export type InlineKeyboard = Array<Array<MarkupItem>>
export type Events = string[]