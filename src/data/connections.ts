import type {
  DeleteCommandOutput,
  PutCommandOutput,
} from '@aws-sdk/lib-dynamodb'

import type { Connection } from '../types'
import { dynamoDeleteItem, dynamoPutItem, dynamoScan } from '../utils'

const WEBSOCKET_NAME = 'chat-websocket-connections'
const CONNECTION_TTL_SECONDS = 60 * 60 * 24 * 7

const getExpiresAt = () =>
  Math.floor(Date.now() / 1000) + CONNECTION_TTL_SECONDS

export const saveConnection = (Item: Connection): Promise<PutCommandOutput> =>
  dynamoPutItem({
    TableName: WEBSOCKET_NAME,
    Item: {
      ...Item,
      date: Item.date ?? Date.now(),
      ttl: getExpiresAt(),
    },
  })

export const removeConnection = (
  connectionId: string,
): Promise<DeleteCommandOutput> =>
  dynamoDeleteItem({
    TableName: WEBSOCKET_NAME,
    Key: { connectionId },
  })

export const getConnections = async (chatId: string) => {
  return dynamoScan<Connection>({
    TableName: WEBSOCKET_NAME,
    FilterExpression: 'chatId = :chatId',
    ExpressionAttributeValues: { ':chatId': String(Number(chatId)) },
  })
}
