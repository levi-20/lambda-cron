<!-- @format -->

> **For version [v1.6](https://github.com/levi-20/lambda-cron/releases/tag/0.1.6) or earlier go [here](https://github.com/levi-20/lambda-cron/tree/9a19b5391d00ee46e322f37f67573b37ead3f0e7).**

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
  - [Interval based Schedule](#interval-based-schedule)
  - [Daily Schedule](#daily-schedule)
  - [Weekly Schedule](#weekly-schedule)
  - [Monthly Schedule](#monthly-schedule)
- [Input Configuration](#input-configuration)
- [Configuration Example](#configuration-example)
  - [Typescript Example](#typescript-example)
  - [YAML Example](#yaml-example)

## Features

- Configure schedules for Lambda functions across different stages.
- Flexible scheduling options:
  - **`interval`**: Schedule to run in interval (minutes, hours, days)
  - **`daily`**: Specific time of a day
  - **`weekly`**: Specific day of the week at at specific time
  - **`monthly`**: Specific day of the month at a specific time.
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

### 1. Interval based schedule

You can schedule a lamba to run in specific intervals. i.e., for unit `minute` job, will run every `x` minutes of `interval`

**`unit`**: _`required`_ Interval unit can have below values:

- `day`
- `hour`
- `minute`

**`duration`**: _`required`_ is the time after which the job will run again (`required`)

```typescript
// hello lambda function will run every 2 minutes
{
  custom: {
    'lambda-cron': {
      dev: {
        hello: {
          schedule: {
            type: 'interval'
            params: {
              unit: 'minute',
              duration: 2,
            },
          }
        }
      }
    }
  }
}
```

```YAML
# hello lambda function will run every 2 days.
custom:
  lambda-cron:
    dev:
      hello:
        schedule:
          type: interval
          params:
            unit: days
            duration: 2
```

### 2. Daily Schedule

With `daily` schedule you can run a job at any time of the day.

- **`hour`**: _`required`, Hour of the day in 24-hour format.
- **`minute`**: _`optional`_, Minute of the hour, value can range from 1 to 59. Defaults to 0 if not provided.

```typescript
{
  schedule: {
    type: 'daily'
    params: {
      hour: <hour-of-the-day>, // required
      minute: <minute-of-the-hour>, // optional, defaults to 0
    }
  }
}
```

```yaml
schedule:
  type: daily
  params:
    hour: <hour-of-the-day> # required
    minute: <minute-of-the-hour> # optional, defaults to 0
```

### 3. Weekly Schedule

With `weekly` schedule you can run any job on a specific day of the week at a specicifix time of the day.

- **`day`**: *`required`* Simply put the day i.e `sunday`, `monday`
- **`hour`**: *`optional`* Hour of the day (24-hour format, ``, defaults to 0).
- **`minute`**: *`optional`* Minute of the hour (`optional`, defaults to 0).

```typescript
schedule:{
  type: 'weekly'
  params: {
    day: <day-of-the-week>, // required
    hour: <hour-of-the-day>, // optional, defaults to 0
    minute: <minute-of-the-hour>, // optional, defaults to 0
  }
}
```

```yaml
schedule:
  type: weekly
  params:
    day: <day-of-the-week> # required, starts at 1
    hour: <hour-of-the-day> # optional, defaults to 0
    minute: <minute-of-the-hour> # optional, defaults to 0
```

### 4. Monthly Schedule

With `monthly` schedule you can run any job on a specific day of the month at a specific time of the day.

- **`day`**: *`required`* Day of the month,ranges from 1-31.
- **`hour`**: *`optional`* Hour of the day in 24-hour format. Defaults to 0 if not provided.
- **`minute`**: *`optional`* Minute of the hour. Defaults to 0 if not provided.

```typescript
schedule:{
  type: 'monthly',
  params: {
    day: <day-of-the-week>, // required, starts to 1
    hour: <hour-of-the-day>, // optional, defaults to 0
    minute: <minute-of-the-hour>, // optional, defaults to 0
  }
}
```

```yaml
schedule:
  monthly:
    day: <day-of-the-week> # required, starts at 1
    hour: <hour-of-the-day> # optional, defaults to 0
    minute: <minute-of-the-hour> # optional, defaults to 0
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
