import { S3 } from 'aws-sdk'

const s3 = new S3({
  region: process.env.region || 'eu-central-1',
  apiVersion: '2006-03-01',
})

export const isFileExist = async (
  Bucket: S3.Bucket,
  Key: string,
): Promise<boolean> => {
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

export const saveFile = async (
  Bucket: S3.Bucket,
  Key: string,
  Body: Buffer,
): Promise<S3.Types.PutObjectOutput> =>
  s3.putObject({ Bucket, Key, Body } as S3.PutObjectRequest).promise()

export const getFile = async (
  Bucket: S3.Bucket,
  Key: string,
): Promise<S3.Types.GetObjectOutput> =>
  s3.getObject({ Bucket, Key } as S3.GetObjectRequest).promise()
