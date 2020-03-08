/* eslint-disable @typescript-eslint/no-explicit-any */
import { map, isEmpty, get, isEqual } from 'lodash'
import { Bucket } from 'aws-sdk/clients/s3'

import { saveConnection, removeConnection, getConnections, get24hChatStats, getChat } from './data'
import { getFile, saveFile, sendEvent } from './utils'
import './dynamo-optimization'

const CHAT_DATA_BUCKET_NAME = process.env.CHAT_DATA_BUCKET_NAME as Bucket

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
      const usersData = await get24hChatStats(chatId)

      await Promise.all(map(connections, (connection) =>
        sendEvent(connection.connectionId, endpoint, { usersData })))

      return { statusCode: 200 }
      // return { statusCode: 200, body: JSON.stringify(data) }
    }
  }

  return { statusCode: 200 }
}

export const updateChatData = async (event: any): Promise<any> => {
  const chatId = get(event.queryStringParameters, 'chatId') || event.chatId

  try {
    const [chatInfo, savedDataBuffer] = await Promise.all([
      await getChat(chatId),
      await getFile(CHAT_DATA_BUCKET_NAME, String(chatId)).catch(() => null),
    ])

    const savedData = JSON.parse(savedDataBuffer?.Body?.toString() || '{}')

    if (!isEqual(savedData, chatInfo) && chatInfo) {
      await saveFile(CHAT_DATA_BUCKET_NAME, chatId, Buffer.from(JSON.stringify(chatInfo)))
    }
    return { statusCode: 200 }
  } catch (e) {
    return { statusCode: 200 }
  }
}
