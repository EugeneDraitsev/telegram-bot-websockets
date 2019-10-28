import { DynamoDB } from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'

import ScanInput = DocumentClient.ScanInput
import QueryOutput = DocumentClient.QueryOutput
import QueryInput = DocumentClient.QueryInput
import PutItemInput = DocumentClient.PutItemInput
import DeleteItemInput = DocumentClient.DeleteItemInput
import PutItemOutput = DocumentClient.PutItemOutput
import DeleteItemOutput = DocumentClient.DeleteItemOutput

const documentClient = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.region || 'eu-central-1',
  service: new DynamoDB({ apiVersion: '2012-08-10', region: process.env.region || 'eu-central-1' }),
})


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dynamoScan = async (inputParams: ScanInput): Promise<any[]> => {
  const results = []
  const params = { ...inputParams }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const scanResults = await documentClient.scan(params).promise()

    results.push(...scanResults.Items || [])

    if (typeof scanResults.LastEvaluatedKey === 'undefined') {
      return results
    }

    params.ExclusiveStartKey = scanResults.LastEvaluatedKey
  }
}

export const dynamoQuery = (params: QueryInput): Promise<QueryOutput> =>
  documentClient.query(params).promise()

export const dynamoPutItem = (params: PutItemInput): Promise<PutItemOutput> => documentClient.put(params).promise()

export const dynamoDeleteItem = (params: DeleteItemInput): Promise<DeleteItemOutput> =>
  documentClient.delete(params).promise()
