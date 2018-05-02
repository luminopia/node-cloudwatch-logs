import {createRequestAuthorization} from './auth'
import fetch from 'node-fetch'

const X_AMZ_TARGET = {
  DescribeLogStreams: 'Logs_20140328.DescribeLogStreams',
  CreateLogStream: 'Logs_20140328.CreateLogStream',
  CreateLogGroup: 'Logs_20140328.CreateLogGroup',
  PutLogEvents: 'Logs_20140328.PutLogEvents',
}

// Endpoint reference
// https://docs.aws.amazon.com/general/latest/gr/rande.html#cwl_region
const HOST_BY_REGION = {
  'us-east-2': 'logs.us-east-2.amazonaws.com'
}

const service = 'logs'

type CreateLogGroupPayload = {
  /** The name of the log group. */
  logGroupName: string,
  // kmsKeyId?: string,
  // tags?: string[],
}

/**
 * Creates a log group with the specified name.
 * https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_CreateLogGroup.html
 */
export const createLogGroup = ({
  payload,
  requestDateTime,
  region,
  accessKeyId,
  secretAccessKey,
}: {
  payload: CreateLogGroupPayload,
  requestDateTime: string,
  region: keyof typeof HOST_BY_REGION,
  accessKeyId: string,
  secretAccessKey: string,
}) => {
  const host = HOST_BY_REGION[region]
  const path = '/'
  const method = 'POST'
  const json = JSON.stringify(payload)

  const signedHeaders = {
    host,
    'x-amz-date': requestDateTime,
    'x-amz-target': X_AMZ_TARGET.CreateLogGroup,
    'accept': 'application/json',
    'content-type': 'application/x-amz-json-1.1; charset=UTF-8',
    'content-length': Buffer.byteLength(json, 'utf8').toString(), 
  }
  
  const authorization = createRequestAuthorization({
    method,
    uri: path,
    query: {},
    headers: signedHeaders,
    payload: json,
    requestDateTime,
    region,
    service,
    accessKeyId,
    secretAccessKey,
  })
  
  const url = `https://${host}${path}`
  return fetch(url, {
    method,
    body: json,
    headers: {
      ...signedHeaders,
      Authorization: authorization,
    },
  })
}

type CreateLogStreamPayload = {
  /** The name of the log group */
  logGroupName: string,
  /** The name of the log stream */
  logStreamName: string,
}
/**
 * Creates a log stream for the specified log group.
 * https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_CreateLogStream.html
 */
export const createLogStream = ({
  payload,
  requestDateTime,
  region,
  accessKeyId,
  secretAccessKey,
}: {
  payload: CreateLogStreamPayload,
  requestDateTime: string,
  region: keyof typeof HOST_BY_REGION,
  accessKeyId: string,
  secretAccessKey: string,
}) => {
  const host = HOST_BY_REGION[region]
  const path = '/'
  const method = 'POST'
  const json = JSON.stringify(payload)

  const signedHeaders = {
    host,
    'x-amz-date': requestDateTime,
    'x-amz-target': X_AMZ_TARGET.CreateLogStream,
    'accept': 'application/json',
    'content-type': 'application/x-amz-json-1.1; charset=UTF-8',
    'content-length': Buffer.byteLength(json, 'utf8').toString(), 
  }
  
  const authorization = createRequestAuthorization({
    method,
    uri: path,
    query: {},
    headers: signedHeaders,
    payload: json,
    requestDateTime,
    region,
    service,
    accessKeyId,
    secretAccessKey,
  })
  
  const url = `https://${host}${path}`
  return fetch(url, {
    method,
    body: json,
    headers: {
      ...signedHeaders,
      Authorization: authorization,
    },
  })
}

/** https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_InputLogEvent.html */
type LogEvent = {
  /** The raw event message. */
  message: string,
  /** number of milliseconds after Jan 1, 1970 00:00:00 UTC. */
  timestamp: number,
}

type PutLogEventsPayload = {
  logEvents: LogEvent[],
  logGroupName: string,
  logStreamName: string,
  sequenceToken?: string,
}

/**
 * Uploads a batch of log events to the specified log stream.
 * https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html
 * 
 * IMPORTANT: DataAlreadyAcceptedException
 */
export const putLogEvents = ({
  payload,
  requestDateTime,
  region,
  accessKeyId,
  secretAccessKey,
}: {
  payload: PutLogEventsPayload,
  requestDateTime: string,
  region: keyof typeof HOST_BY_REGION,
  accessKeyId: string,
  secretAccessKey: string,
}) => {
  const host = HOST_BY_REGION[region]
  const path = '/'
  const method = 'POST'
  const json = JSON.stringify(payload)

  const signedHeaders = {
    host,
    'x-amz-date': requestDateTime,
    'x-amz-target': X_AMZ_TARGET.PutLogEvents,
    'accept': 'application/json',
    'content-type': 'application/x-amz-json-1.1; charset=UTF-8',
    'content-length': Buffer.byteLength(json, 'utf8').toString(), 
  }
  
  const authorization = createRequestAuthorization({
    method,
    uri: path,
    query: {},
    headers: signedHeaders,
    payload: json,
    requestDateTime,
    region,
    service,
    accessKeyId,
    secretAccessKey,
  })
  
  const url = `https://${host}${path}`
  return fetch(url, {
    method,
    body: json,
    headers: {
      ...signedHeaders,
      Authorization: authorization,
    },
  })
}

type DescribeLogStreamsPayload = {
  /** The name of the log group. */
  logGroupName: string,
  // descending?: boolean,
  // limit?: number,
  // logStreamNamePrefix?: string,
  // nextToken?: string,
  // orderBy?: string,
}

/**
 * Lists the log streams for the specified log group.
 * https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_DescribeLogStreams.html
 */
export const describeLogStreams = ({
  payload,
  requestDateTime,
  region,
  accessKeyId,
  secretAccessKey,
}: {
  payload: DescribeLogStreamsPayload,
  requestDateTime: string,
  region: keyof typeof HOST_BY_REGION,
  accessKeyId: string,
  secretAccessKey: string,
}) => {
  const host = HOST_BY_REGION[region]
  const path = '/'
  const method = 'POST'
  const json = JSON.stringify(payload)

  const signedHeaders = {
    host,
    'x-amz-date': requestDateTime,
    'x-amz-target': X_AMZ_TARGET.DescribeLogStreams,
    'accept': 'application/json',
    'content-type': 'application/x-amz-json-1.1; charset=UTF-8',
    'content-length': Buffer.byteLength(json, 'utf8').toString(), 
  }
  
  const authorization = createRequestAuthorization({
    method,
    uri: path,
    query: {},
    headers: signedHeaders,
    payload: json,
    requestDateTime,
    region,
    service,
    accessKeyId,
    secretAccessKey,
  })
  
  const url = `https://${host}${path}`
  return fetch(url, {
    method,
    body: json,
    headers: {
      ...signedHeaders,
      Authorization: authorization,
    },
  })
}