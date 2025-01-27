<!-- @format -->

# lambda-cron

[![NPM version](https://img.shields.io/npm/v/lambda-cron.svg)](https://www.npmjs.com/package/lambda-cron)
[![Build](https://github.com/levi-20/cronify/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/levi-20/cronify/actions/workflows/npm-publish.yml)

### Serverless Plugin for Scheduling Lambda Cron Jobs

This plugin enables you to schedule Lambda functions with a variety of cron job frequencies. It supports different(`dev`,`test`,`production`) stages with options for different timing intervals like minutes, daily, weekly, and monthly schedules.

> Note: This plugin works specifically for one `aws` provider.

## Features

- Configure schedules for Lambda functions across different stages.
- Flexible scheduling options: minute-based and hour -based and day-based intervals, specific daily times, weekly days, and monthly schedules.
- Pass custom input parameters to Lambda functions.

## Configuration Example

Below is an example of how to configure the `lambda-cron` plugin for the `dev` stage:

### Typescript Example

```typescript
import type { AWS } from '@serverless/typescript';

import hello from './src/functions/hello';
import books from './src/functions/books';
import best from './src/functions/best';
import lib from './src/functions/lib';

const serverlessConfiguration: AWS = {
	service: 'aws-serverless-typescript-project',
	frameworkVersion: '3',
	// include it in your plugins
	plugins: ['serverless-esbuild', 'lambda-cron'],
	provider: {
		name: 'aws',
		runtime: 'nodejs20.x',
		environment: {
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
			NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
		},
	},
	functions: {
		hello,
		books,
		lib,
		best,
	},
	package: { individually: true },
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

package:
  individually: true

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

### Rate based Schedule

You can schedule a lamba to run in specific intervals like `minutes`, `hours`, `days`

- **`hours`**: Hour of the day (24-hour format).
- **`minutes`**: Minute of the hour (optional, defaults to 0).

### Weekly Schedule

- **`day`**: Day of the week (1 = Sunday, 7 = Saturday).
- **`hours`**: Hour of the day (24-hour format, optional, defaults to 0).
- **`minutes`**: Minute of the hour (optional, defaults to 0).

```yaml
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

## License

This project is licensed under the MIT License.
