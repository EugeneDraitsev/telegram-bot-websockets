import { toLower, first } from 'lodash'

import { dynamoPutItem, dynamoQuery, getUserName } from '../utils'
import { Chat } from '../types'

type ChatStat = {
  chatName: string;
  chatInfo: Chat;
  id: string;
}

const getChatStatistic = async (chat_id: string): Promise<ChatStat> => {
  const params = {
    TableName: 'chat-statistics',
    ExpressionAttributeValues: { ':chatId': String(chat_id) },
    KeyConditionExpression: 'chatId = :chatId',
  }

  const result = await dynamoQuery(params)
  return first(result.Items) as ChatStat
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateChatInfo = async (chatId: string, chat: Chat): Promise<void> => {
  const chatStatistics = await getChatStatistic(chatId)
  const chatName = chat?.title || getUserName(chat)

  if (chatStatistics) {
    chatStatistics.chatName = toLower(chatName || getUserName(chat))
    chatStatistics.chatInfo = chat ?? {} as Chat

    const params = {
      TableName: 'chat-statistics',
      Item: chatStatistics,
    }

    await dynamoPutItem(params)
  }
}
