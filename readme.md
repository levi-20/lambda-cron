<!-- @format -->

# Cron jobs for serverless lambda

[![NPM version](https://img.shields.io/npm/v/lambda-cron.svg)](https://www.npmjs.com/package/lambda-cron)
[![Build](https://github.com/levi-20/cronify/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/levi-20/cronify/actions/workflows/npm-publish.yml)

### Serverless Plugin for Scheduling Lambda Cron Jobs

This plugin enables you to schedule Lambda functions with a variety of cron job frequencies. It supports different(`dev`,`test`,`production`) stages with options for different timing intervals like minutes, daily, weekly, and monthly schedules.

> Note: This plugin build specifically for `aws` provider.

## Features

- Configure schedules for Lambda functions across different stages.
- Flexible scheduling options: minute-based and hour -based and day-based intervals, specific daily times, weekly days, and monthly schedules.
- Pass custom input parameters to Lambda functions.

### Rate based Schedule

You can schedule a lamba to run in specific intervals. i.e., `minutes` job will run every `x` minutes of `interval`

**`runRate`**: can have below values:

- `days`
- `hours`
- `minutes`

```typescript
schedule: {
  rate: {
    runRate: 'minutes',
    interval: 2,
  },
  // this will run every 2 minutes
}
```

```YAML
schedule:
  rate:
    runRate: days
    interval: 2
  # this will run every 2 days.
```

### Weekly Schedule

With `weekly` schedule you can run any job on a specific day of the week.

- **`day`**: Day of the week raanges from 1-7. (`1` = Sunday, `7` = Saturday)
  - `1` is Sunday
  - `2` is Monday
  - `3` is Tuesday
  - `4` is Wednesay
  - `5` is Thursday
  - `6` is Friday
  - `7` is Saturday
- **`hours`**: Hour of the day (24-hour format, optional, defaults to 0).
- **`minutes`**: Minute of the hour (optional, defaults to 0).

```typescript
weekly: {
  day: <day-of-the-week>, // required, starts to 1
  hours: <hour-of-the-day>, // optional, defaults to 0
  minutes: <minute-of-the-hour>, // optional, defaults to 0
}
```

```yaml
weekly:
  day: <day-of-the-week> # required, starts at 1
  hours: <hour-of-the-day> # optional, defaults to 0
  minutes: <minute-of-the-hour> # optional, defaults to 0
```

### Monthly Schedule

```typescript
monthly: {
  day: <day-of-the-month>, // starts with 1
  hours: <hour-of-the-day>, // optional, defaults to 0
  minutes: <minute-of-the-hour>, // optional, defaults to 0
}
```

- **`day`**: Day of the month (defaults to 0).
- **`hours`**: Hour of the day (24-hour format, optional, defaults to 0).
- **`minutes`**: Minute of the hour (optional, defaults to 0).

## Input Configuration

Each Lambda function can accept custom input parameters:

```typescript
input: {
	key: 'value';
}
```

You can provide key-value pairs as input parameters to the Lambda function.

## Usage

1. Install the plugin in your Serverless project.
2. Add the `lambda-cron` configuration block to your `serverless.yml` or `serverless.ts` file.

## Configuration Example

Below is an example of how to configure the `lambda-cron` plugin for the `dev` stage:

### Typescript Example

```typescript
const serverlessConfiguration: AWS = {
	service: 'aws-serverless-typescript-project',
	frameworkVersion: '3',
	// include it in your plugins
	plugins: ['serverless-esbuild', 'lambda-cron'],
	provider: {
		name: 'aws',
		...
	},
	functions: {
		hello,
		books,
		lib,
		best,
	},
	custom: {
		'lambda-cron': {
			dev: {
				books: {
					schedule: {
						rate: {
							runRate: 'minutes',
							interval: 2,
						},
					},
					input: {
						key: 'value',
					},
				},
				hello: {
					schedule: {
						daily: {
							hours: 16,
							minutes: 27, // optional if not provided it wil take as 0
						},
					},
					input: {
						key: 'value',
					},
				},
				best: {
					schedule: {
						weekly: {
							day: 1, // starts from 1
							hours: 16, // optional if not provided it wil take as 0
							minutes: 15, // optional if not provided it wil take as 0
						},
					},
					input: {
						key: 'value',
					},
				},
				lib: {
					schedule: {
						monthly: {
							day: 26,
							hours: 16, // optional if not provided it wil take as 0
							minutes: 25, // optional if not provided it wil take as 0
						},
					},
					input: {
						key: 'value',
					},
				},
			},
		},
	},
};

module.exports = serverlessConfiguration;
```

### YAML Example

```yaml
service: aws-serverless-typescript-project
frameworkVersion: '3'

plugins:
  - serverless-esbuild
  - lambda-cron

provider:
  name: aws
  runtime: nodejs20.x
  environment:
    AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
    NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000'

functions:
  hello:
    handler: handler.hello
  books:
    handler: handler.books
  lib:
    handler: handler.lib
  best:
    handler: handler.best

custom:
  lambda-cron:
    dev:
      books:
        schedule:
          rate:
            runRate: 'minutes'
            interval: 2
        input:
          key: value

      hello:
        schedule:
          daily:
            hours: 16
            minutes: 27 # optional, defaults to 0
        input:
          key: value

      best:
        schedule:
          weekly:
            day: 1 # starts from 1
            hours: 16 # optional, defaults to 0
            minutes: 15 # optional, defaults to 0
        input:
          key: value

      lib:
        schedule:
          monthly:
            day: 26
            hours: 16 # optional, defaults to 0
            minutes: 25 # optional, defaults to 0
        input:
          key: value
```

## License

This project is licensed under the MIT License.
