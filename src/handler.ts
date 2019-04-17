import { ApiGatewayManagementApi } from 'aws-sdk'
import { dynamoPutItem, dynamoDeleteItem } from './utils'

export default async (event: any) => {
  const { connectionId, domainName, stage } = event.requestContext

  const client = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: `https://${domainName}/${stage}`,
  })

  await client
    .postToConnection({
      ConnectionId: connectionId,
      Data: `connectionId: ${connectionId}, data: ${event.body}`,
    })
    .promise()

  return { statusCode: 200 }
}

export const connect = async (event: any) => {
  const { connectionId } = event.requestContext

  await dynamoPutItem({
    TableName: 'chat-websocket-connections',
    Item: { connectionId },
  })

  return { statusCode: 200 }
}

export const disconnect = async (event: any) => {
  const { connectionId } = event.requestContext

  await dynamoDeleteItem({
    TableName: 'chat-websocket-connections',
    Key: { connectionId },
  })

  return { statusCode: 200 }
}
