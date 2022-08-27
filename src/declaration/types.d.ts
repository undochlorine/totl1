import {MarkupItem} from "./interfaces";
import {STATE_NORMAL, STATE_WAITING_FOR_A_GRADE} from '../states'

export type StudyMode = "offline" | "online" | undefined
export type TimetableForDay = string[] | null
export type InlineKeyboard = Array<Array<MarkupItem>>
export type Events = string[]
export type State = STATE_NORMAL | STATE_WAITING_FOR_A_GRADE