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
  /** 
   * The name of the log group. 
   * - Log group names can be between 1 and 512 characters long.
   * - Log group names consist of the following characters: a-z, A-Z, 0-9, '_' (underscore), '-' (hyphen), 
   *   '/' (forward slash), and '.' (period).
   */
  logGroupName: string,
  /**
   * Tags as key-value pairs.
   * - Key Length Constraints: Minimum length of 1. Maximum length of 128.
   * - Key Pattern: ^([\p{L}\p{Z}\p{N}_.:/=+\-@]+)$
   * - Value Length Constraints: Maximum length of 256.
   * - Value Pattern: ^([\p{L}\p{Z}\p{N}_.:/=+\-@]*)$
   */
  tags?: {[key: string]: string},
  // NOTE: No plans to encrypt our log data (yet) so the below param is not applicable
  // kmsKeyId?: string,
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
  /** 
   * TODO: Verify payload.logGroupName format
   * - Log group names can be between 1 and 512 characters long.
   * - Log group names consist of the following characters: a-z, A-Z, 0-9, '_' (underscore), '-' (hyphen), 
   *   '/' (forward slash), and '.' (period).
   */
  /**
   * TODO: Verify payload.tags format
   * - Key Length Constraints: Minimum length of 1. Maximum length of 128.
   * - Key Pattern: ^([\p{L}\p{Z}\p{N}_.:/=+\-@]+)$
   * - Value Length Constraints: Maximum length of 256.
   * - Value Pattern: ^([\p{L}\p{Z}\p{N}_.:/=+\-@]*)$
   */
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
  /**
   * TODO: Error handling. See docs for errors:
   * https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_CreateLogGroup.html
   */
}

type CreateLogStreamPayload = {
  /** The name of the log group */
  logGroupName: string,
  /** The name of the log stream */
  logStreamName: string,
}
/**
 * Creates a log stream for the specified log group.
 * - Log stream names can be between 1 and 512 characters long.
 * - The ':' (colon) and '*' (asterisk) characters are not allowed.
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
  /** 
   * TODO: Verify payload.logGroupName format
   * - Log group names can be between 1 and 512 characters long.
   * - Log group names consist of the following characters: a-z, A-Z, 0-9, '_' (underscore), '-' (hyphen), 
   *   '/' (forward slash), and '.' (period).
   */
  /**
   * TODO: Verify payload.logStreamName format
   * - Log stream names can be between 1 and 512 characters long.
   * - The ':' (colon) and '*' (asterisk) characters are not allowed.
   */
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
  /**
   * TODO: Error handling. See docs for errors:
   * https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_CreateLogStream.html
   */
}

/** https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_InputLogEvent.html */
type LogEvent = {
  /** The raw event message. */
  message: string,
  /** number of milliseconds after Jan 1, 1970 00:00:00 UTC. */
  timestamp: number,
}

type PutLogEventsPayload = {
  /** 
   * The batch of log events.
   * - The maximum batch size is 1,048,576 bytes, and this size is calculated as the sum of all event messages in UTF-8, plus 26 bytes for each log event.
   * - None of the log events in the batch can be more than 2 hours in the future.
   * - None of the log events in the batch can be older than 14 days or the retention period of the log group.
   * - The log events in the batch must be in chronological ordered by their time stamp. The time stamp is the time the event occurred, expressed as the number of milliseconds after Jan 1, 1970 00:00:00 UTC. (In AWS PowerShell Tools and the AWS SDK for .NET, the timestamp is specified in .NET format: yyyy-mm-ddThh:mm:ss. For example, 2017-09-15T13:45:30.)
   * - The minimum number of log events in a batch is 1.
   * - The maximum number of log events in a batch is 10,000.
   * - A batch of log events in a single request cannot span more than 24 hours. Otherwise, the operation fails.
   */
  logEvents: LogEvent[],
  /** The name of the log group */
  logGroupName: string,
  /** The name of the log stream */
  logStreamName: string,
  /** 
   * The sequence token obtained from the response of the previous PutLogEvents call.
   * An upload in a newly created log stream does not require a sequence token. 
   * You can also get the sequence token using DescribeLogStreams. 
   * If you call PutLogEvents twice within a narrow time period using the same value for sequenceToken, 
   * both calls may be successful, or one may be rejected.
   * Client should keep track of the sequence token and provide it to subsequent requests.
   * 
   * NOTE: Behnam, probably this means we create a new stream between user sessions so that we don't have to
   * keep the sequence token in long term storage. AFAICT there's no limit on number of streams.
   */
  sequenceToken?: string,
}

/**
 * Uploads a batch of log events to the specified log stream.
 * https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html
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
  /** 
   * TODO: Verify payload.logEvents conforms to batch requirements
   * - The maximum batch size is 1,048,576 bytes, and this size is calculated as the sum of all event messages in UTF-8, plus 26 bytes for each log event.
   * - None of the log events in the batch can be more than 2 hours in the future.
   * - None of the log events in the batch can be older than 14 days or the retention period of the log group.
   * - The log events in the batch must be in chronological ordered by their time stamp. The time stamp is the time the event occurred, expressed as the number of milliseconds after Jan 1, 1970 00:00:00 UTC. (In AWS PowerShell Tools and the AWS SDK for .NET, the timestamp is specified in .NET format: yyyy-mm-ddThh:mm:ss. For example, 2017-09-15T13:45:30.)
   * - The minimum number of log events in a batch is 1.
   * - The maximum number of log events in a batch is 10,000.
   * - A batch of log events in a single request cannot span more than 24 hours. Otherwise, the operation fails.
   */
  /** 
   * TODO: Verify payload.logGroupName format
   * - Log group names can be between 1 and 512 characters long.
   * - Log group names consist of the following characters: a-z, A-Z, 0-9, '_' (underscore), '-' (hyphen), 
   *   '/' (forward slash), and '.' (period).
   */
  /**
   * TODO: Verify payload.logStreamName format
   * - Log stream names can be between 1 and 512 characters long.
   * - The ':' (colon) and '*' (asterisk) characters are not allowed.
   */
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
  /**
   * TODO: Error handling. See docs for errors:
   * https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html
   */
}

type DescribeLogStreamsPayload = {
  /** The name of the log group. */
  logGroupName: string,

  // NOTE: I don't anticipate we'll need any of the following parameters, so I'm not handling them.
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
  /** 
   * TODO: Verify payload.logGroupName format
   * - Log group names can be between 1 and 512 characters long.
   * - Log group names consist of the following characters: a-z, A-Z, 0-9, '_' (underscore), '-' (hyphen), 
   *   '/' (forward slash), and '.' (period).
   */
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
  /**
   * TODO: Error handling. See docs for errors:
   * https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_DescribeLogStreams.html
   */
}