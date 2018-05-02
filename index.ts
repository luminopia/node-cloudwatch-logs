import {createHash} from 'crypto'
// console.log('hello', process.env)

// https://docs.aws.amazon.com/general/latest/gr/sigv4_signing.html

/**
 * https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html
 * @param param0 
 */
const canonicalRequest = ({
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

  const signedHeaders = Object.keys(headers).sort()
    .map(formatHeaderKey)
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

const expected = `
GET
/
Action=ListUsers&Version=2010-05-08
content-type:application/x-www-form-urlencoded; charset=utf-8
host:iam.amazonaws.com
x-amz-date:20150830T123600Z

content-type;host;x-amz-date
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
`

const actual = canonicalRequest({
  method: 'GET',
  uri: '/',
  query: {
    Action: 'ListUsers',
    Version: '2010-05-08',
  },
  headers: {
    host: 'iam.amazonaws.com',
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    'X-Amz-Date': '20150830T123600Z',
  },
  payload: '',
})

console.log('Expected:'); console.log(expected)
console.log('Actual:'); console.log(actual)