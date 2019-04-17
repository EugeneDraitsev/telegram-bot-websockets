import { DynamoDB, AWSError } from 'aws-sdk'

const documentClient = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.region || 'eu-central-1',
  service: new DynamoDB({ apiVersion: '2012-08-10', region: process.env.region || 'eu-central-1' }),
})

export const dynamoScan = (params: DynamoDB.DocumentClient.ScanInput) => new Promise((resolve, reject) => {
  const scanParams = { ...params }

  const results: any[] = []

  const onScan = (err: AWSError, data: DynamoDB.ScanOutput) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log('Unable to query. Error:', JSON.stringify(err, null, 2))
      reject(err)
    } else {
      results.push(...data.Items!)
      // continue scanning if we have more records, because
      // scan can retrieve a maximum of 1MB of data
      if (typeof data.LastEvaluatedKey !== 'undefined') {
        scanParams.ExclusiveStartKey = data.LastEvaluatedKey
        documentClient.scan(scanParams, onScan)
      } else {
        resolve(results)
      }
    }
  }

  documentClient.scan(scanParams, onScan)
})

export const dynamoPutItem = (params: DynamoDB.DocumentClient.PutItemInput) => documentClient.put(params).promise()

export const dynamoDeleteItem = (params: DynamoDB.DocumentClient.DeleteItemInput) => documentClient.delete(params).promise()
