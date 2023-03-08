import { chain, groupBy } from 'lodash'

import { dynamoQuery } from '../utils'
import { ChatEvent } from '../types'

const DAY = 1000 * 60 * 60 * 24

export const get24hChatStats = async (chatId: string) => {
  const { Items } = await dynamoQuery({
    TableName: 'chat-events',
    KeyConditionExpression: 'chatId = :chatId AND #date > :date',
    ExpressionAttributeValues: {
      ':chatId': String(Number(chatId)),
      ':date': Date.now() - DAY,
    },
    ExpressionAttributeNames: { '#date': 'date' },
  })

  const data = Items as ChatEvent[]

  const groupedMessages = groupBy(data, (x) => x.userInfo.id)

  return chain(data)
    .map((x) => x.userInfo)
    .uniqBy('id')
    .map((x) => ({ ...x, messages: groupedMessages[x.id].length }))
    .orderBy('messages', 'desc')
    .value()
}

export const getHistoricalData = async (chatId: string) => {
  const result = await dynamoQuery({
    TableName: 'chat-statistics',
    ExpressionAttributeValues: { ':chatId': String(Number(chatId)) },
    KeyConditionExpression: 'chatId = :chatId',
  })

  return result?.Items?.[0]?.users ?? []
}
