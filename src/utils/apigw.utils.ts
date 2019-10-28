import { ApiGatewayManagementApi } from 'aws-sdk'

export const sendEvent = async (connectionId: string, endpoint: string, data?: object): Promise<object> => {
  const client = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: `https://${endpoint}`,
  })

  return client.postToConnection({
    ConnectionId: connectionId,
    Data: JSON.stringify(data || ''),
  }).promise()
}
