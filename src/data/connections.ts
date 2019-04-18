import { dynamoDeleteItem, dynamoPutItem, dynamoScan } from '../utils'

export interface Connection {
  connectionId: string
  date?: number
  chatId?: string
}

export const saveConnection = (Item: Connection) => dynamoPutItem({
  TableName: 'chat-websocket-connections',
  Item,
})

export const removeConnection = (connectionId: string) => dynamoDeleteItem({
  TableName: 'chat-websocket-connections',
  Key: { connectionId },
})

export const getConnections = async (chatId: string) => {
  const result = await dynamoScan({
    TableName: 'chat-websocket-connections',
    FilterExpression: 'chatId = :chatId',
    ExpressionAttributeValues: { ':chatId': String(Number(chatId)) },
  })
  return result as Connection []
}
