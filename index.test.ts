import {createCanonicalRequest, canonicalRequestHash, requestSignable, signingKey} from './'

const tests = []

const testCreateCanonicalRequest = () => {
  const expected = `GET
/
Action=ListUsers&Version=2010-05-08
content-type:application/x-www-form-urlencoded; charset=utf-8
host:iam.amazonaws.com
x-amz-date:20150830T123600Z

content-type;host;x-amz-date
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
  
  const actual = createCanonicalRequest({
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
  
  if (expected !== actual) {
    console.warn('createCanonicalRequest test failed')
    console.warn('Expected:\n'); console.warn(expected)
    console.warn('\nActual:\n'); console.warn(actual)
  } else {
    console.log('createCanonicalRequest test successful!')
  }
}
tests.push(testCreateCanonicalRequest)

const testCanonicalRequestHash = () => {
  const expected = 'f536975d06c0309214f805bb90ccff089219ecd68b2577efef23edd43b7e1a59'
  const canonicalRequest = createCanonicalRequest({
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
  const actual = canonicalRequestHash(canonicalRequest)

  if (expected !== actual) {
    console.warn('canonicalRequestHash test failed')
    console.warn('Expected:\n'); console.warn(expected)
    console.warn('\nActual:\n'); console.warn(actual)
  } else {
    console.log('canonicalRequestHash test successful!')
  }
}
tests.push(testCanonicalRequestHash)

const testRequestSignable = () => {
  const expected = `AWS4-HMAC-SHA256
20150830T123600Z
20150830/us-east-1/iam/aws4_request
f536975d06c0309214f805bb90ccff089219ecd68b2577efef23edd43b7e1a59`
  const canonicalRequest = createCanonicalRequest({
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
  const actual = requestSignable({canonicalRequest, requestDateTime: '20150830T123600Z', region: 'us-east-1', service: 'iam'})

  if (expected !== actual) {
    console.warn('requestSignable test failed')
    console.warn('Expected:\n'); console.warn(expected)
    console.warn('\nActual:\n'); console.warn(actual)
  } else {
    console.log('requestSignable test successful!')
  }
}
tests.push(testRequestSignable)

const testSigningKey = () => {
  const expected = 'c4afb1cc5771d871763a393e44b703571b55cc28424d1a5e86da6ed3c154a4b9'
  const actual = signingKey({
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY',
    requestDate: '20150830',
    region: 'us-east-1',
    service: 'iam',
  })

  if (expected !== actual) {
    console.warn('signingKey test failed')
    console.warn('Expected:\n'); console.warn(expected)
    console.warn('\nActual:\n'); console.warn(actual)
  } else {
    console.log('signingKey test successful!')
  }
}
tests.push(testSigningKey)

// Run da tests
tests.forEach((t) => t())
