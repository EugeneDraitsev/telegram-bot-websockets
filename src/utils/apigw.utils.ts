import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi'

const clients = new Map<string, ApiGatewayManagementApiClient>()

type AwsError = {
  name?: string
  code?: string
  statusCode?: number
  $metadata?: {
    httpStatusCode?: number
  }
}

const normalizeEndpoint = (endpoint: string) =>
  endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `https://${endpoint}`

const getClient = (endpoint: string) => {
  const normalizedEndpoint = normalizeEndpoint(endpoint)
  const existingClient = clients.get(normalizedEndpoint)

  if (existingClient) {
    return existingClient
  }

  const client = new ApiGatewayManagementApiClient({
    endpoint: normalizedEndpoint,
  })

  clients.set(normalizedEndpoint, client)
  return client
}

export const isGoneConnectionError = (error: unknown) => {
  const awsError = error as AwsError

  return (
    awsError.name === 'GoneException' ||
    awsError.code === 'GoneException' ||
    awsError.statusCode === 410 ||
    awsError.$metadata?.httpStatusCode === 410
  )
}

export const sendEvent = async (
  connectionId: string,
  endpoint: string,
  data?: unknown,
) => {
  const client = getClient(endpoint)
  const payload = typeof data === 'string' ? data : JSON.stringify(data ?? '')

  return client.send(
    new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: payload,
    }),
  )
}
