/**
 * Code based on AWS doc:
 * https://docs.aws.amazon.com/general/latest/gr/sigv4_signing.html
 * 
 * AWS requests require a special Authorization header which includes a request signature.
 */

import {createHash, createHmac, createSign} from 'crypto'

const algorithm = 'AWS4-HMAC-SHA256'
const hashAlgorithm = 'sha256'


type RequestHeaders = {[headerKey: string]: string | string[]} 
  // The host header must be included as a signed header
  & {host: string}

/**
 * The list of headers that you included in the canonical headers. 
 * By adding this list of headers, you tell AWS which headers in the request are part of the signing process and which 
 * ones AWS can ignore (for example, any additional headers added by a proxy) for purposes of validating the request.
 * 
 * To create the signed headers list, convert all header names to lowercase, sort them by character code, and use 
 * a semicolon to separate the header names. 
 */
const createSignedHeaders = (headers: RequestHeaders) => (
  Object.keys(headers)
    .map(formatHeaderKey)
    .sort()
    .join(';')
)
const formatHeaderKey = (k: string) => k.toLowerCase()
const formatHeaderValue = (v: string) => v.trim().replace(/\s+/g, ' ')

/**
 * Create a string that includes information from your request in a standardized (canonical) format.
 * Must be in the specific format to ensure the signature calculated by the client matches the one calculated by AWS.
 * https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html
 */
export const createCanonicalRequest = ({
  method,
  uri,
  query,
  headers,
  payload,
}: {
  method: string,
  uri: string,
  query: {[queryKey: string]: string},
  headers: RequestHeaders,
  payload: string,
}) => {
  const canonicalQueryString = Object.keys(query).sort()
    .reduce((queryParams: string[], queryKey) => [...queryParams, `${queryKey}=${query[queryKey]}`], [])
    .join('&')

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

  const signedHeaders = createSignedHeaders(headers)

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
  return createHash(hashAlgorithm)
    .update(payload)
    .digest('hex')
}

export const createCanonicalRequestHash = (canonicalRequest: string) => createHash(hashAlgorithm).update(canonicalRequest).digest('hex')

const requestScope = ({
  requestDate,
  region,
  service,
}: {
  requestDate: string,
  region: string,
  service: string,
}) => {
  return `${requestDate}/${region}/${service}/aws4_request`
}

/**
 * The string that is signed by the signing key to create the request signature.
 * https://docs.aws.amazon.com/general/latest/gr/sigv4-create-string-to-sign.html
 */
export const createRequestSignable = ({
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
  const credentialScope = requestScope({
    requestDate: extractRequestDate(requestDateTime),
    region,
    service,
  })
  const requestHash = createCanonicalRequestHash(canonicalRequest)

  return [
    algorithm,
    requestDateTime,
    credentialScope,
    requestHash,
  ].join('\n')
}

/**
 * Extracts a request date in format YYYYMMDD from an ISO8601 basic-formatted datetime.
 * @param requestDateTime Must be ISO8601 basic format: YYYYMMDD'T'HHMMSS'Z'
 */
const extractRequestDate = (requestDateTime: string) => requestDateTime.slice(0, 8)

/**
 * Creates an Hmac instance of a signing key to be used to sign the request.
 */
export const createSigningKeyHmac = ({
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
  const kDate = createHmac(hashAlgorithm, 'AWS4' + secretAccessKey).update(requestDate)
  const kRegion = createHmac(hashAlgorithm, kDate.digest()).update(region)
  const kService = createHmac(hashAlgorithm, kRegion.digest()).update(service)
  const kSigning = createHmac(hashAlgorithm, kService.digest()).update('aws4_request')
  return kSigning
}

/**
 * Creates a request signature to be used as part of the AWS Authorization header.
 * https://docs.aws.amazon.com/general/latest/gr/sigv4-calculate-signature.html
 */
export const createRequestSignature = ({
  method,
  uri,
  query,
  headers,
  payload,
  requestDateTime,
  region,
  service,
  secretAccessKey,
}: {
  method: string,
  uri: string,
  query: {[queryKey: string]: string},
  headers: RequestHeaders,
  payload: string,
  requestDateTime: string,
  region: string,
  service: string,
  secretAccessKey: string,
}) => {
  const canonicalRequest = createCanonicalRequest({
    method,
    uri,
    query,
    headers,
    payload,
  })
  const requestDate = extractRequestDate(requestDateTime)
  const requestSigningKey = createSigningKeyHmac({
    secretAccessKey,
    requestDate,
    region,
    service,
  }).digest()
  const signable = createRequestSignable({canonicalRequest, requestDateTime, region, service})
  const signature = createHmac(hashAlgorithm, requestSigningKey).update(signable).digest('hex')
  return signature
}

/**
 * Create an Authorization header value for AWS API v4 requests.
 * https://docs.aws.amazon.com/general/latest/gr/sigv4-add-signature-to-request.html
 */
export const createRequestAuthorization = ({
  /** Uppercase format (e.g. GET, POST) */
  method,
  /**
   * The canonical URI is the URI-encoded version of the absolute path component of the URI, 
   * which is everything in the URI from the HTTP host to the question mark character ("?") that begins the query 
   * string parameters (if any).
   * 
   * WARNING: The following requirements are not implemented by the method.
   * - Normalize URI paths according to RFC 3986. Remove redundant and relative path components. 
   * - Each path segment must be URI-encoded.
   */
  uri,
  /**
   * Query parameters to be constructed into a query string.
   * 
   * WARNING: Keys and values are expected to be URI-encoded with the following rules:
   * - Do not URI-encode any of the unreserved characters that RFC 3986 defines: 
   *   A-Z, a-z, 0-9, hyphen ( - ), underscore ( _ ), period ( . ), and tilde ( ~ ).
   * - Percent-encode all other characters with %XY, where X and Y are hexadecimal characters (0-9 and uppercase A-F). 
   *   For example, the space character must be encoded as %20 (not using '+', as some encoding schemes do) and 
   *   extended UTF-8 characters must be in the form %XY%ZA%BC.
   */
  query,
  /**
   * Request headers.
   * Must include the `host` header.
   */
  headers,
  /** Request payload */
  payload,
  /** ISO8601 basic format: YYYYMMDD'T'HHMMSS'Z' */
  requestDateTime,
  /** AWS region, e.g. us-east-2 */
  region,
  /** AWS service requested, e.g. `iam`, `logs` */
  service,
  /** AWS user credentials access key id */
  accessKeyId,
  /** AWS user credentials secret access key */
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
  accessKeyId: string,
  secretAccessKey: string,
}) => {
  const requestDate = extractRequestDate(requestDateTime)

  const requestCredential = `${accessKeyId}/${requestScope({requestDate, region, service})}`
  const signedHeaders = createSignedHeaders(headers)
  const signature = createRequestSignature({
    method,
    uri,
    query,
    headers,
    payload,
    requestDateTime,
    region,
    service,
    secretAccessKey,
  })

  return `${algorithm} Credential=${requestCredential}, SignedHeaders=${signedHeaders}, Signature=${signature}`
}
