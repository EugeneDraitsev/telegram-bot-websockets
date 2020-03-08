import * as FormData from 'form-data'

import { botRequest, getFileUrl } from '../utils'
import { Chat, File } from '../types'

export const getFile = async (fileId: string): Promise<string> => {
  const body = new FormData()
  body.append('file_id', fileId)

  const file: File = await botRequest('getFile', body)
  return getFileUrl(file.file_path)
}

export const getChat = async (chatId: string): Promise<Chat> => {
  const body = new FormData()
  body.append('chat_id', chatId)

  const chat = await botRequest('getChat', body)

  if (chat && chat.photo) {
    const photoUrl = await getFile(chat.photo.big_file_id)
    return { ...chat, photoUrl } as Chat
  }

  return chat
}
