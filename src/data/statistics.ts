import type { ChatEvent, UserInfo } from '../types'
import { dynamoQuery } from '../utils'

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

  const data = (Items ?? []) as ChatEvent[]
  const messageCountByUserId = data.reduce<Record<number, number>>(
    (acc, event) => {
      acc[event.userInfo.id] = (acc[event.userInfo.id] ?? 0) + 1
      return acc
    },
    {},
  )
  const usersById = data.reduce<Map<number, UserInfo>>((acc, event) => {
    if (!acc.has(event.userInfo.id)) {
      acc.set(event.userInfo.id, event.userInfo)
    }

    return acc
  }, new Map())

  return Array.from(usersById.values())
    .map((user) => ({ ...user, messages: messageCountByUserId[user.id] ?? 0 }))
    .sort((a, b) => b.messages - a.messages)
}

export const getHistoricalData = async (chatId: string) => {
  const result = await dynamoQuery({
    TableName: 'chat-statistics',
    ExpressionAttributeValues: { ':chatId': String(Number(chatId)) },
    KeyConditionExpression: 'chatId = :chatId',
  })

  return result?.Items?.[0]?.users ?? []
}
