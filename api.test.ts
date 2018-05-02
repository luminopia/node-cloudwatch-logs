import * as Api from './api'

const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

if (accessKeyId === undefined) throw new Error('Must have AWS_ACCESS_KEY_ID defined in env')
if (secretAccessKey === undefined) throw new Error('Must have AWS_SECRET_ACCESS_KEY defined in env')

const requestDate = new Date()
// Format: 20180502T210129Z
const requestDateTime = requestDate.toISOString()
  .replace(/[-:]/g, '')
  .replace(/\.\d*/, '')

// Api.createLogGroup({
//   payload: {
//     logGroupName: 'test-log-group-2019-05-02',
//   },
//   region: 'us-east-2',
//   requestDateTime,
//   accessKeyId,
//   secretAccessKey,
// }).then(async (response) => {
//   console.log('code:', response.status)
//   console.log('body:', await response.text())
// })

// Api.createLogStream({
//   payload: {
//     logGroupName: 'test-log-group-2019-05-02',
//     logStreamName: 'test-log-stream-1',
//   },
//   region: 'us-east-2',
//   requestDateTime,
//   accessKeyId,
//   secretAccessKey,
// }).then(async (response) => {
//   console.log('code:', response.status)
//   console.log('body:', await response.text())
// })

// Api.putLogEvents({
//   payload: {
//     logEvents: [{
//       message: 'test',
//       timestamp: requestDate.getTime(),
//     }],
//     logGroupName: 'test-log-group-2019-05-02',
//     logStreamName: 'test-log-stream-1',
//   },
//   region: 'us-east-2',
//   requestDateTime,
//   accessKeyId,
//   secretAccessKey,
// }).then(async (response) => {
//   console.log('code:', response.status)
//   console.log('body:', await response.text())
// })

// Api.describeLogStreams({
//   payload: {
//     logGroupName: 'test-log-group-2019-05-02',
//   },
//   region: 'us-east-2',
//   requestDateTime,
//   accessKeyId,
//   secretAccessKey,
// }).then(async (response) => {
//   console.log('code:', response.status)
//   console.log('body:', await response.json())
//   console.log('headers', response.headers)
// })
