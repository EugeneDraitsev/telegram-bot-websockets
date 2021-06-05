import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'

import { dynamoDeleteItem, dynamoPutItem, dynamoScan } from '../utils'
import { Connection } from '../types'

export const saveConnection = (
  Item: Connection,
): Promise<DocumentClient.PutItemOutput> =>
  dynamoPutItem({
    TableName: 'chat-websocket-connections',
    Item,
  })

export const removeConnection = (
  connectionId: string,
): Promise<DocumentClient.DeleteItemOutput> =>
  dynamoDeleteItem({
    TableName: 'chat-websocket-connections',
    Key: { connectionId },
  })

export const getConnections = async (chatId: string): Promise<Connection[]> => {
  const result = await dynamoScan({
    TableName: 'chat-websocket-connections',
    FilterExpression: 'chatId = :chatId',
    ExpressionAttributeValues: { ':chatId': String(Number(chatId)) },
  })
  return result as Connection[]
}
