import { DynamoDB } from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'

const documentClient = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.region || 'eu-central-1',
  service: new DynamoDB({
    apiVersion: '2012-08-10',
    region: process.env.region || 'eu-central-1',
  }),
})

export const dynamoScan = async (inputParams: DocumentClient.ScanInput) => {
  const results = []
  const params = { ...inputParams }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const scanResults = await documentClient.scan(params).promise()

    results.push(...(scanResults.Items || []))

    if (typeof scanResults.LastEvaluatedKey === 'undefined') {
      return results
    }

    params.ExclusiveStartKey = scanResults.LastEvaluatedKey
  }
}

export const dynamoQuery = (params: DocumentClient.QueryInput) =>
  documentClient.query(params).promise()

export const dynamoPutItem = (params: DocumentClient.PutItemInput) =>
  documentClient.put(params).promise()

export const dynamoDeleteItem = (params: DocumentClient.DeleteItemInput) =>
  documentClient.delete(params).promise()
