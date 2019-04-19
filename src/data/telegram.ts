import * as FormData from 'form-data'
import { botRequest, getFileUrl } from '../utils'
import { Chat, File } from '../types'


export const getFile = async (fileId: string) => {
  const body = new FormData()
  body.append('file_id', fileId)

  const file: File = await botRequest('getFile', body)
  return getFileUrl(file.file_path)
}

export const getChat = async (chatId: string) => {
  const body = new FormData()
  body.append('chat_id', chatId)

  const chat: Chat = await botRequest('getChat', body)

  if (chat && chat.photo) {
    const photoUrl = await getFile(chat.photo.big_file_id)
    return { ...chat, photoUrl }
  }

  return chat
}
