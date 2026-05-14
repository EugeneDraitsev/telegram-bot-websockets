import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'
import type {
  DeleteCommandInput,
  DeleteCommandOutput,
  PutCommandInput,
  PutCommandOutput,
  QueryCommandInput,
  QueryCommandOutput,
  ScanCommandInput,
} from '@aws-sdk/lib-dynamodb'

const region = process.env.region || process.env.AWS_REGION || 'eu-central-1'
const client = new DynamoDBClient({ region })
const documentClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
})

export const dynamoScan = async <T = Record<string, unknown>>(
  inputParams: ScanCommandInput,
): Promise<T[]> => {
  const results: T[] = []
  const params = { ...inputParams }

  while (true) {
    const scanResults = await documentClient.send(new ScanCommand(params))

    results.push(...((scanResults.Items as T[]) || []))

    if (typeof scanResults.LastEvaluatedKey === 'undefined') {
      return results
    }

    params.ExclusiveStartKey = scanResults.LastEvaluatedKey
  }
}

export const dynamoQuery = (
  params: QueryCommandInput,
): Promise<QueryCommandOutput> => documentClient.send(new QueryCommand(params))

export const dynamoPutItem = (
  params: PutCommandInput,
): Promise<PutCommandOutput> => documentClient.send(new PutCommand(params))

export const dynamoDeleteItem = (
  params: DeleteCommandInput,
): Promise<DeleteCommandOutput> =>
  documentClient.send(new DeleteCommand(params))
