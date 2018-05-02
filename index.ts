import {createHash, createHmac} from 'crypto'

// Code based on AWS doc:
// https://docs.aws.amazon.com/general/latest/gr/sigv4_signing.html

/**
 * https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html
 * @param param0 
 */
export const createCanonicalRequest = ({
  /** Uppercase format (e.g. GET, POST) */
  method,
  /**
   * The canonical URI is the URI-encoded version of the absolute path component of the URI, 
   * which is everything in the URI from the HTTP host to the question mark character ("?") that begins the query 
   * string parameters (if any).
   * 
   * Normalize URI paths according to RFC 3986. Remove redundant and relative path components. 
   * Each path segment must be URI-encoded.
   */
  uri,
  /**
   * Keys and values are expected to be URI-encoded with the following rules:
   * - Do not URI-encode any of the unreserved characters that RFC 3986 defines: 
   *   A-Z, a-z, 0-9, hyphen ( - ), underscore ( _ ), period ( . ), and tilde ( ~ ).
   * - Percent-encode all other characters with %XY, where X and Y are hexadecimal characters (0-9 and uppercase A-F). 
   *   For example, the space character must be encoded as %20 (not using '+', as some encoding schemes do) and 
   *   extended UTF-8 characters must be in the form %XY%ZA%BC.
   */
  query,
  /**
   * At a minimum, you must include the host header
   */
  headers,
  payload,
}: {
  method: string,
  uri: string,
  query: {[queryKey: string]: string},
  headers: {[headerKey: string]: string | string[]} & {host: string},
  payload: string,
}) => {
  const canonicalQueryString = Object.keys(query).sort()
    .reduce((queryParams: string[], queryKey) => [...queryParams, `${queryKey}=${query[queryKey]}`], [])
    .join('&')

  const formatHeaderKey = (k: string) => k.toLowerCase()
  const formatHeaderValue = (v: string) => v.trim().replace(/\s+/g, ' ')
  const caseInsensitiveSort = (a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase())

  const canonicalHeaders = Object.keys(headers).sort(caseInsensitiveSort)
    .reduce((formattedHeaders: string[], headerKey) => {
      const headerValue = headers[headerKey]
      const formattedHeaderValue = (() => {
        if (typeof headerValue === 'string') {
          return `${formatHeaderKey(headerKey)}:${formatHeaderValue(headerValue)}`
        }
        return headerValue.map((v) => formatHeaderValue(v)).join(',')
      })()

      return [...formattedHeaders, formattedHeaderValue]
    }, [])
    .join('\n') + '\n' // Add trailing \n

  const signedHeaders = Object.keys(headers)
    .map(formatHeaderKey)
    .sort()
    .join(';')

  const hashedPayload = hashRequestPayload(payload)

  return [
    method,
    uri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    hashedPayload,
  ].join('\n')
}

const hashRequestPayload = (payload: string) => {
  return createHash('sha256')
    .update(payload)
    .digest('hex')
}

export const canonicalRequestHash = (canonicalRequest: string) => createHash('sha256').update(canonicalRequest).digest('hex')

/**
 * https://docs.aws.amazon.com/general/latest/gr/sigv4-create-string-to-sign.html
 * @param canonicalRequest Hashed with SHA256
 */
export const requestSignable = ({
  canonicalRequest,
  requestDateTime,
  region,
  service,
}: {
  canonicalRequest: string,
  requestDateTime: string,
  region: string,
  service: string,
}) => {
  // For SHA256, AWS4-HMAC-SHA256 is the algorithm
  const algorithm = 'AWS4-HMAC-SHA256' 
  const credentialScope = `${extractRequestDate(requestDateTime)}/${region}/${service}/aws4_request`
  const requestHash = canonicalRequestHash(canonicalRequest)

  return [
    algorithm,
    requestDateTime,
    credentialScope,
    requestHash,
  ].join('\n')
}

/**
 * @param requestDateTime ISO8601 basic format: YYYYMMDD'T'HHMMSS'Z'
 */
const extractRequestDate = (requestDateTime: string) => requestDateTime.slice(0, 8)

/**
 * https://docs.aws.amazon.com/general/latest/gr/sigv4-calculate-signature.html
 */
export const createRequestSignature = ({
  /** Uppercase format (e.g. GET, POST) */
  method,
  /**
   * The canonical URI is the URI-encoded version of the absolute path component of the URI, 
   * which is everything in the URI from the HTTP host to the question mark character ("?") that begins the query 
   * string parameters (if any).
   * 
   * Normalize URI paths according to RFC 3986. Remove redundant and relative path components. 
   * Each path segment must be URI-encoded.
   */
  uri,
  /**
   * Keys and values are expected to be URI-encoded with the following rules:
   * - Do not URI-encode any of the unreserved characters that RFC 3986 defines: 
   *   A-Z, a-z, 0-9, hyphen ( - ), underscore ( _ ), period ( . ), and tilde ( ~ ).
   * - Percent-encode all other characters with %XY, where X and Y are hexadecimal characters (0-9 and uppercase A-F). 
   *   For example, the space character must be encoded as %20 (not using '+', as some encoding schemes do) and 
   *   extended UTF-8 characters must be in the form %XY%ZA%BC.
   */
  query,
  /**
   * At a minimum, you must include the host header
   */
  headers,
  payload,
  /** ISO8601 basic format: YYYYMMDD'T'HHMMSS'Z' */
  requestDateTime,
  /** AWS region, e.g. us-east-2 */
  region,
  /** AWS service requested, e.g. iam */
  service,
  secretAccessKey,
}: {
  method: string,
  uri: string,
  query: {[queryKey: string]: string},
  headers: {[headerKey: string]: string | string[]} & {host: string},
  payload: string,
  requestDateTime: string,
  region: string,
  service: string,
  secretAccessKey: string,
}) => {

}

export const signingKey = ({
  secretAccessKey,
  /** YYYYMMDD */
  requestDate,
  region,
  service,
}: {
  secretAccessKey: string,
  requestDate: string,
  region: string,
  service: string,
}) => {
  const algorithm = 'sha256'
  const kDate = createHmac(algorithm, 'AWS4' + secretAccessKey).update(requestDate)
  const kRegion = createHmac(algorithm, kDate.digest()).update(region)
  const kService = createHmac(algorithm, kRegion.digest()).update(service)
  const kSigning = createHmac(algorithm, kService.digest()).update('aws4_request')
  return kSigning.digest('hex')
}