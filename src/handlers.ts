/* eslint-disable @typescript-eslint/no-explicit-any */
import { map, isEmpty, get, toLower } from 'lodash'

import { saveConnection, removeConnection, getConnections, get24hChatStats, getChat, getHistoricalData } from './data'
import { dynamoScan, sendEvent } from './utils'
import { updateDynamoChatInfo, updateS3ChatInfo } from './data/chat-info'
import './dynamo-optimization'


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': 'X-Requested-With',
}

export const connect = async (event: any): Promise<any> => {
  const { connectionId } = event.requestContext
  await saveConnection({ connectionId, date: Date.now() })
  return { statusCode: 200 }
}

export const disconnect = async (event: any): Promise<any> => {
  const { connectionId } = event.requestContext
  await removeConnection(connectionId)
  return { statusCode: 200 }
}

export const stats = async (event: any): Promise<any> => {
  const { connectionId, domainName, stage } = event.requestContext
  const { chatId } = JSON.parse(event.body)

  const [usersData, chatInfo] = await Promise.all([
    get24hChatStats(chatId),
    getChat(chatId),
    saveConnection({ connectionId, chatId: String(Number(chatId)) }),
  ])

  await sendEvent(connectionId, `${domainName}/${stage}`, { usersData, chatInfo })

  return { statusCode: 200 }
}

export const broadcastStats = async (event: any): Promise<any> => {
  const chatId = get(event.queryStringParameters, 'chatId') || event.chatId
  const endpoint = get(event.queryStringParameters, 'endpoint') || event.endpoint

  if (chatId && endpoint) {
    const connections = await getConnections(chatId)

    if (!isEmpty(connections)) {
      const [usersData, historicalData] = await Promise.all([
        await get24hChatStats(chatId).catch(() => []),
        await getHistoricalData(chatId).catch(() => []),
      ])

      await Promise.all(map(connections, (connection) =>
        sendEvent(connection.connectionId, endpoint, { usersData, historicalData })))

      return { statusCode: 200 }
      // return { statusCode: 200, body: JSON.stringify(data) }
    }
  }

  return { statusCode: 200 }
}

export const updateChatData = async (event: any): Promise<any> => {
  const chatId = String(get(event.queryStringParameters, 'chatId', event.chatId))

  try {
    const chatInfo = await getChat(chatId)

    await Promise.all([
      await updateS3ChatInfo(chatId, chatInfo),
      await updateDynamoChatInfo(chatId, chatInfo),
    ])

    return { statusCode: 200 }
  } catch (e) {
    return { statusCode: 200 }
  }
}

export const getChatByName = async (event: any): Promise<any> => {
  try {
    const name = get(event.queryStringParameters, 'name') || event.name

    if (!name || name.length < 3) {
      return {
        statusCode: 400,
        body: JSON.stringify({ massage: 'you should specify chat name' }),
      }
    }

    const chats = await dynamoScan({
      TableName: 'chat-statistics',
      FilterExpression: 'contains(chatName, :chatName)',
      ExpressionAttributeValues: { ':chatName': toLower(name) },
    })

    const escapedChats = chats.map((chat) => chat.chatInfo)

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(escapedChats) }
  } catch (e) {
    return { statusCode: 502 }
  }
}
