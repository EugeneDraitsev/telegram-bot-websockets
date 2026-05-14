import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyWebsocketEventV2,
} from 'aws-lambda'

import {
  get24hChatStats,
  getConnections,
  getHistoricalData,
  removeConnection,
  saveConnection,
} from './data'
import { dynamoScan, isGoneConnectionError, sendEvent } from './utils'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': 'X-Requested-With',
}

type BroadcastEvent = {
  chatId?: string
  endpoint?: string
  queryStringParameters?: {
    chatId?: string
    endpoint?: string
  } | null
}

type SearchEvent = APIGatewayProxyEvent & {
  name?: string
}

const ok = (): APIGatewayProxyResult => ({ statusCode: 200, body: '' })

const badRequest = (message: string): APIGatewayProxyResult => ({
  statusCode: 400,
  headers: corsHeaders,
  body: JSON.stringify({ message }),
})

const normalizeChatId = (chatId: string | number) => {
  const numericChatId = Number(chatId)

  return Number.isFinite(numericChatId) ? String(numericChatId) : undefined
}

const parseStatsBody = (body: string | null | undefined) => {
  try {
    return JSON.parse(body || '{}') as { chatId?: string | number }
  } catch {
    return {}
  }
}

const sendStatsToConnection = async (
  connectionId: string,
  endpoint: string,
  data: unknown,
) => {
  try {
    await sendEvent(connectionId, endpoint, data)
  } catch (error) {
    if (isGoneConnectionError(error)) {
      await removeConnection(connectionId)
      return
    }

    throw error
  }
}

export const connect = async (
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResult> => {
  const { connectionId } = event.requestContext
  if (!connectionId) {
    return badRequest('missing connection id')
  }

  await saveConnection({ connectionId, date: Date.now() })
  return ok()
}

export const disconnect = async (
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResult> => {
  const { connectionId } = event.requestContext
  if (!connectionId) {
    return badRequest('missing connection id')
  }

  await removeConnection(connectionId)
  return ok()
}

export const stats = async (
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResult> => {
  const { connectionId, domainName, stage } = event.requestContext
  if (!connectionId || !domainName || !stage) {
    return badRequest('missing websocket request context')
  }

  const { chatId } = parseStatsBody(event.body)
  if (!chatId) {
    return badRequest('missing chat id')
  }

  const normalizedChatId = normalizeChatId(chatId)
  if (!normalizedChatId) {
    return badRequest('invalid chat id')
  }

  const [usersData, historicalData] = await Promise.all([
    get24hChatStats(normalizedChatId),
    getHistoricalData(normalizedChatId),
    saveConnection({ connectionId, chatId: normalizedChatId }),
  ])

  await sendStatsToConnection(connectionId, `${domainName}/${stage}`, {
    usersData,
    historicalData,
  })

  return ok()
}

export const broadcastStats = async (
  event: BroadcastEvent,
): Promise<APIGatewayProxyResult> => {
  const chatId = event.queryStringParameters?.chatId || event.chatId
  const endpoint = event.queryStringParameters?.endpoint || event.endpoint
  const normalizedChatId = chatId ? normalizeChatId(chatId) : undefined

  if (normalizedChatId && endpoint) {
    const connections = await getConnections(normalizedChatId)

    if (connections.length > 0) {
      const [usersData, historicalData] = await Promise.all([
        get24hChatStats(normalizedChatId).catch(() => []),
        getHistoricalData(normalizedChatId).catch(() => []),
      ])

      const results = await Promise.allSettled(
        connections.map((connection) =>
          sendStatsToConnection(connection.connectionId, endpoint, {
            usersData,
            historicalData,
          }),
        ),
      )
      const failedDeliveries = results.filter(
        (result) => result.status === 'rejected',
      )

      if (failedDeliveries.length > 0) {
        console.error('Failed websocket deliveries', {
          chatId: normalizedChatId,
          count: failedDeliveries.length,
        })
      }

      return ok()
    }
  }

  return ok()
}
export const getChatByName = async (
  event: SearchEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const name = event.queryStringParameters?.name || event.name

    if (!name || name.length < 3) {
      return badRequest('you should specify chat name')
    }

    const chats = await dynamoScan({
      TableName: 'chat-statistics',
      FilterExpression: 'contains(chatName, :chatName)',
      ExpressionAttributeValues: { ':chatName': name.toLowerCase() },
    })

    const escapedChats = chats.map((chat) => chat.chatInfo)

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(escapedChats),
    }
  } catch (_e) {
    return { statusCode: 502, body: '' }
  }
}
