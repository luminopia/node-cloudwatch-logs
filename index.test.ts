import {createCanonicalRequest, canonicalRequestHash, requestSignature} from './'

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
    console.log('createCanonicalRequest test failed')
    console.log('Expected:\n'); console.log(expected)
    console.log('\nActual:\n'); console.log(actual)
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
    console.log('canonicalRequestHash test failed')
    console.log('Expected:\n'); console.log(expected)
    console.log('\nActual:\n'); console.log(actual)
  } else {
    console.log('canonicalRequestHash test successful!')
  }
}
tests.push(testCanonicalRequestHash)

const testRequestSignature = () => {
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
  const actual = requestSignature({canonicalRequest, requestDateTime: '20150830T123600Z', region: 'us-east-1', service: 'iam'})

  if (expected !== actual) {
    console.log('requestSignature test failed')
    console.log('Expected:\n'); console.log(expected)
    console.log('\nActual:\n'); console.log(actual)
  } else {
    console.log('requestSignature test successful!')
  }
}
tests.push(testRequestSignature)

// Run da tests
tests.forEach((t) => t())
