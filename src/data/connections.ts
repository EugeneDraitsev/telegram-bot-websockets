import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'

import { dynamoDeleteItem, dynamoPutItem, dynamoScan } from '../utils'
import { Connection } from '../types'

const WEBSOCKET_NAME = 'chat-websocket-connections'

export const saveConnection = (
  Item: Connection,
): Promise<DocumentClient.PutItemOutput> =>
  dynamoPutItem({
    TableName: WEBSOCKET_NAME,
    Item,
  })

export const removeConnection = (
  connectionId: string,
): Promise<DocumentClient.DeleteItemOutput> =>
  dynamoDeleteItem({
    TableName: WEBSOCKET_NAME,
    Key: { connectionId },
  })

export const getConnections = async (chatId: string): Promise<Connection[]> => {
  const result = await dynamoScan({
    TableName: WEBSOCKET_NAME,
    FilterExpression: 'chatId = :chatId',
    ExpressionAttributeValues: { ':chatId': String(Number(chatId)) },
  })
  return result as Connection[]
}
