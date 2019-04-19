export interface UserInfo {
  id: number
  is_bot: boolean
  last_name?: string
  first_name?: string
  username?: string
  language_code?: string
}

export interface ChatEvent {
  chatId: number,
  date: number,
  userInfo: UserInfo
}
