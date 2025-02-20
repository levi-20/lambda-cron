>This documentation is applicable only for [v1.6](https://github.com/levi-20/lambda-cron/tree/9a19b5391d00ee46e322f37f67573b37ead3f0e7) and earlier. For latest docs [go here](https://github.com/levi-20/lambda-cron/blob/main/readme.md)
<!-- @format -->

# Cron jobs for serverless lambda

[![NPM version](https://img.shields.io/npm/v/lambda-cron.svg)](https://www.npmjs.com/package/lambda-cron)
[![Build](https://github.com/levi-20/cronify/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/levi-20/cronify/actions/workflows/npm-publish.yml)

### Serverless Plugin for Scheduling Lambda Cron Jobs

This plugin enables you to schedule Lambda functions with a variety of cron job frequencies. It supports different(`dev`,`test`,`production`) stages with options for different timing intervals like minutes, daily, weekly, and monthly schedules.

> Note: This plugin build specifically for `aws` provider.


## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Schedule Configuration](#schedule-configuration)
  - [Rate based Schedule](#rate-based-schedule)
  - [Weekly Schedule](#weekly-schedule)
  - [Monthly Schedule](#monthly-schedule)
- [Input Configuration](#input-configuration)
- [Configuration Example](#configuration-example)
  - [Typescript Example](#typescript-example)
  - [YAML Example](#yaml-example)

## Features

- Configure schedules for Lambda functions across different stages.
- Flexible scheduling options:
  - Schedule to run in interval (minutes, hours, days)
  - Specific time of a day
  - Specific day of the week at at specific time
  - Specific day of the month at a specific time.
- Pass custom input parameters to Lambda functions.

## Installation

- First add it to your project as dev dependecy

  - npm: `npm i -D lambda-cron`
  - pnpm: `pnpm i -D lambda-cron`
  - yarn: `yarn add -D lambda-cron`

- Include it in your plugins:

  ```yaml
  plugins:
    - lambda-cron
  ```

## Schedule Configuration

### Rate based Schedule

You can schedule a lamba to run in specific intervals. i.e., `minutes` job will run every `x` minutes of `interval`

**`runRate`**: can have below values (`required`):

- `days`
- `hours`
- `minutes`

**`interval`**: is the time after which the job will run again (`required`)

```typescript
{
  schedule: {
  rate: {
    runRate: 'minutes',
    interval: 2,
  },
  // this will run every 2 minutes
  },
  input: {
    key1: 'value1',
    key2: 'value2'
  }
}
```

```YAML
schedule:
  rate:
    runRate: days
    interval: 2
input:
  key1: value1
  key2: value2
  # this will run every 2 days.
```

### Weekly Schedule

With `weekly` schedule you can run any job on a specific day of the week at a specicifix time of the day.

- **`day`**: Day of the week raanges from 1-7. (`1` = Sunday, `7` = Saturday, `required`)
  - `1` is Sunday
  - `2` is Monday
  - `3` is Tuesday
  - `4` is Wednesay
  - `5` is Thursday
  - `6` is Friday
  - `7` is Saturday
- **`hours`**: Hour of the day (24-hour format, `optional`, defaults to 0).
- **`minutes`**: Minute of the hour (`optional`, defaults to 0).

```typescript
schedule:{
  weekly: {
    day: <day-of-the-week>, // required, starts to 1
    hours: <hour-of-the-day>, // optional, defaults to 0
    minutes: <minute-of-the-hour>, // optional, defaults to 0
  }
}
```

```yaml
schedule:
  weekly:
    day: <day-of-the-week> # required, starts at 1
    hours: <hour-of-the-day> # optional, defaults to 0
    minutes: <minute-of-the-hour> # optional, defaults to 0
```

### Monthly Schedule

With `monthly` schedule you can run any job on a specific day of the month at a specific time of the day.

- **`day`**: Day of the montn.(raanges from 1-31, `required`)
- **`hours`**: Hour of the day (24-hour format, `optional`, defaults to 0).
- **`minutes`**: Minute of the hour (`optional`, defaults to 0).

```typescript
schedule:{
  monthly: {
    day: <day-of-the-week>, // required, starts to 1
    hours: <hour-of-the-day>, // optional, defaults to 0
    minutes: <minute-of-the-hour>, // optional, defaults to 0
  }
}
```

```yaml
schedule:
  monthly:
    day: <day-of-the-week> # required, starts at 1
    hours: <hour-of-the-day> # optional, defaults to 0
    minutes: <minute-of-the-hour> # optional, defaults to 0
```

## Configuration Example

Below is an example of how to configure the `lambda-cron` plugin for the `dev` stage:

### Typescript Example

```typescript
{
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
