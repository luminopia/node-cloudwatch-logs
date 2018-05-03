# ts-cloudwatch-logs

A demo/reference implementation for creating a wrapper to consume the [Cloudwatch Logs API](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/Welcome.html).

## Usage

Modify [src/api.test.ts](src/api.test.ts) to send whatever API calls you would like.

```sh
AWS_ACCESS_KEY_ID=IDGOESHERE AWS_SECRET_ACCESS_KEY=SECRETGOESHERE yarn ts-node src/api.test.ts
```
