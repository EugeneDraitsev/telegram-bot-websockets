import { S3 } from 'aws-sdk'

const s3 = new S3({ region: process.env.region || 'eu-central-1', apiVersion: '2006-03-01' })

export const isFileExist = async (Bucket: S3.Bucket, Key: string) => {
  try {
    const params = {
      Bucket,
      Key,
    } as S3.GetObjectRequest

    await s3.headObject(params).promise()
    return true
  } catch (e) {
    return false
  }
}

export const saveFile = async (Bucket: S3.Bucket, Key: string, Body: Buffer) =>
  s3.putObject({ Bucket, Key, Body } as S3.PutObjectRequest).promise()
