import { dynamoPutItem, dynamoDeleteItem } from './utils'

export const connect = async (event: any) => {
  const { connectionId } = event.requestContext

  await dynamoPutItem({
    TableName: 'chat-websocket-connections',
    Item: { connectionId },
  })

  console.log(`Connection ${connectionId} saved to dynamo`) // eslint-disable-line no-console

  return { statusCode: 200 }
}

export const disconnect = async (event: any) => {
  const { connectionId } = event.requestContext

  await dynamoDeleteItem({
    TableName: 'chat-websocket-connections',
    Key: { connectionId },
  })

  console.log(`Connection ${connectionId} deleted from dynamo`) // eslint-disable-line no-console

  return { statusCode: 200 }
}
