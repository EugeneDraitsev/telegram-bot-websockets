import { map, isEmpty, get } from 'lodash'

import { saveConnection, removeConnection, getConnections, get24hChatStats } from './data'
import { sendEvent } from './utils'

export const connect = async (event: any) => {
  const { connectionId } = event.requestContext
  await saveConnection({ connectionId, date: Date.now() })
  return { statusCode: 200 }
}

export const disconnect = async (event: any) => {
  const { connectionId } = event.requestContext
  await removeConnection(connectionId)
  return { statusCode: 200 }
}

export const stats = async (event: any) => {
  const { connectionId, domainName, stage } = event.requestContext
  const { chatId } = JSON.parse(event.body)

  const [data] = await Promise.all([
    get24hChatStats(chatId),
    saveConnection({ connectionId, chatId: String(Number(chatId)) }),
  ])

  await sendEvent(connectionId, `${domainName}/${stage}`, data)

  return { statusCode: 200 }
}

export const broadcastStats = async (event: any) => {
  const chatId = get(event.queryStringParameters, 'chatId') || event.chatId
  const endpoint = get(event.queryStringParameters, 'endpoint') || event.endpoint

  if (chatId && endpoint) {
    const connections = await getConnections(chatId)

    if (!isEmpty(connections)) {
      const data = await get24hChatStats(chatId)

      await Promise.all(map(connections, connection =>
        sendEvent(connection.connectionId, endpoint, data)))

      return { statusCode: 200 }
      // return { statusCode: 200, body: JSON.stringify(data) }
    }
  }

  return { statusCode: 200 }
}
