import { toLower, first, isEqual } from 'lodash'
import { Bucket } from 'aws-sdk/clients/s3'

import { dynamoPutItem, dynamoQuery, getFile, getUserName, saveFile } from '../utils'
import { Chat } from '../types'

const CHAT_DATA_BUCKET_NAME = process.env.CHAT_DATA_BUCKET_NAME as Bucket

type ChatStat = {
  chatName: string;
  chatInfo: Chat;
  id: string;
}

const getChatStatistic = async (chatId: string): Promise<ChatStat> => {
  const params = {
    TableName: 'chat-statistics',
    ExpressionAttributeValues: { ':chatId': chatId },
    KeyConditionExpression: 'chatId = :chatId',
  }

  const result = await dynamoQuery(params)
  return first(result.Items) as ChatStat
}

export const updateDynamoChatInfo = async (chatId: string, chatInfo: Chat): Promise<void> => {
  const chatStatistics = await getChatStatistic(chatId)
  const chatName = chatInfo?.title || getUserName(chatInfo)

  if (chatInfo && chatStatistics && !isEqual(chatStatistics.chatInfo, chatInfo)) {
    chatStatistics.chatName = toLower(chatName || getUserName(chatInfo))
    chatStatistics.chatInfo = chatInfo ?? {} as Chat

    const params = {
      TableName: 'chat-statistics',
      Item: chatStatistics,
    }

    await dynamoPutItem(params)
  }
}

export const updateS3ChatInfo = async (chatId: string, chatInfo: Chat): Promise<void> => {
  const savedDataBuffer = await getFile(CHAT_DATA_BUCKET_NAME, String(chatId)).catch(() => null)
  const s3Data = JSON.parse(savedDataBuffer?.Body?.toString() || '{}')

  if (!isEqual(s3Data, chatInfo) && chatInfo) {
    await saveFile(CHAT_DATA_BUCKET_NAME, chatId, Buffer.from(JSON.stringify(chatInfo)))
  }
}
