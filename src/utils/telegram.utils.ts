import * as FormData from 'form-data'
import fetch from 'node-fetch'
import { Bucket } from 'aws-sdk/clients/s3'
import { last, split } from 'lodash'

import { isFileExist, saveFile } from '.'

interface Response {
  ok: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
}

const BUCKET_NAME = process.env.IMAGES_BUCKET_NAME as Bucket
const BASE_URL = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`
const FILE_URL = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const botRequest = async (method: string, body: FormData): Promise<any> => {
  const url = `${BASE_URL}/${method}`
  const response: Response = await fetch(url, { body, method: 'POST' }).then((r) => r.json())
  if (response.ok) {
    return response.result
  }
  return null
}

export const getFileUrl = async (filePath: string): Promise<string> => {
  try {
    const fileName = last(split(filePath, '/')) || ''
    const s3Url = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`

    if (await isFileExist(BUCKET_NAME, filePath)) {
      return s3Url
    }

    const fileUrl = `${FILE_URL}/${filePath}`
    const file = await fetch(fileUrl).then((r) => r.buffer())
    await saveFile(BUCKET_NAME, fileName, file)

    return s3Url
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
    return ''
  }
}
