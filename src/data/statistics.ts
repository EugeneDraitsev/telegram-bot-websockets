/* eslint-disable camelcase */
import { chain, groupBy } from 'lodash'

import { dynamoQuery } from '../utils'

const DAY = 1000 * 60 * 60 * 24

interface UserInfo {
  id: number
  is_bot: number
  last_name?: string
  first_name?: string
  username?: string
  language_code?: string
}

interface ChatEvent {
  chatId: number,
  date: number,
  userInfo: UserInfo
}

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

  const data = Items as ChatEvent []

  const groupedMessages = groupBy(data, x => x.userInfo.id)

  const users = chain(data)
    .map(x => x.userInfo)
    .uniqBy('id')
    .map(x => ({ ...x, messages: groupedMessages[x.id].length }))
    .orderBy('messages', 'desc')
    .value()

  return users
}
