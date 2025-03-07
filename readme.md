<!-- @format -->

> **For version [v0.1.6](https://github.com/levi-20/lambda-cron/releases/tag/0.1.6) or earlier, go [here](https://github.com/levi-20/lambda-cron/tree/9a19b5391d00ee46e322f37f67573b37ead3f0e7).**

# Cron Jobs for Serverless Lambda

[![NPM version](https://img.shields.io/npm/v/lambda-cron.svg)](https://www.npmjs.com/package/lambda-cron)
[![Build](https://github.com/levi-20/cronify/actions/workflows/ci.yml/badge.svg)](https://github.com/levi-20/cronify/actions/workflows/ci.yml)

## Serverless Plugin for Scheduling Lambda Cron Jobs

This plugin enables you to schedule Lambda functions with a variety of cron job frequencies. It supports different stages (`dev`, `test`, `production`) with options for various timing intervals such as minutes, daily, weekly, and monthly schedules.

> Note: This plugin is built specifically for the `AWS` provider.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Schedule Configuration](#schedule-configuration)
  - [Interval-Based Schedule](#interval-based-schedule)
  - [Daily Schedule](#daily-schedule)
  - [Weekly Schedule](#weekly-schedule)
  - [Monthly Schedule](#monthly-schedule)
- [Input Configuration](#input-configuration)
- [Configuration Example](#configuration-example)
  - [TypeScript Example](#typescript-example)
  - [TypeScript Example](#typescript-example)
  - [YAML Example](#yaml-example)

## Features

- Configure schedules for Lambda functions across different stages.
- Flexible scheduling options:
  - **`interval`**: Schedule to run at intervals (minutes, hours, days).
  - **`daily`**: Specific time of the day.
  - **`weekly`**: Specific day of the week at a specific time.
  - **`monthly`**: Specific day of the month at a specific time.
- Pass custom input parameters to Lambda functions.

## Installation

- First, add it to your project as a dev dependency:
- First, add it to your project as a dev dependency:

  - npm: `npm i -D lambda-cron`
  - pnpm: `pnpm i -D lambda-cron`
  - yarn: `yarn add -D lambda-cron`

- Include it in your plugins:

  ```yaml
  plugins:
    - lambda-cron
  ```

## Schedule Configuration

### Interval-Based Schedule

You can schedule a Lambda function to run at specific intervals. For example, a job with the unit `minutes` will run every `x` minutes.

**`unit`**: _`required`_ - Interval unit can be one of the following:

- `days`
- `hours`
- `minutes`

**`duration`**: _`required`_ - Time interval after which the job will run again.

```typescript
// The hello Lambda function will run every 2 minutes.
{
  custom: {
    'lambda-cron': {
      dev: {
        hello: {
          schedule: {
            type: 'interval',
            params: {
              unit: 'minutes',
              duration: 2,
            },
          },
        },
      },
    },
  },
}
```

```yaml
# The hello Lambda function will run every 2 days.
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

### Daily Schedule

With a `daily` schedule, you can run a job at a specific time of the day.

- **`hour`**: _`required`_ - Hour of the day in 24-hour format.
- **`minute`**: _`optional`_ - Minute of the hour (1-59). Defaults to `0` if not provided.

```typescript
{
  schedule: {
    type: 'daily',
    params: {
      hour: <hour-of-the-day>, // required
      minute: <minute-of-the-hour>, // optional, defaults to 0
    },
  },
}
```

```yaml
schedule:
  type: daily
  params:
    hour: <hour-of-the-day> # required
    minute: <minute-of-the-hour> # optional, defaults to 0
```

### Weekly Schedule

With a `weekly` schedule, you can run a job on a specific day of the week at a specified time.

- **`day`**: _`required`_ - The day of the week (e.g., `sunday`, `monday`).
- **`hour`**: _`optional`_ - Hour of the day in 24-hour format (defaults to 0).
- **`minute`**: _`optional`_ - Minute of the hour (defaults to 0).

```yaml
schedule:
  type: weekly
  params:
    day: <day-of-the-week> # required
    hour: <hour-of-the-day> # optional, defaults to 0
    minute: <minute-of-the-hour> # optional, defaults to 0
```

### Monthly Schedule

With a `monthly` schedule, you can run a job on a specific day of the month at a specified time.

- **`day`**: _`required`_ - Day of the month (1-31).
- **`hour`**: _`optional`_ - Hour of the day in 24-hour format (defaults to 0).
- **`minute`**: _`optional`_ - Minute of the hour (defaults to 0).

```yaml
schedule:
  type: monthly
  params:
    day: <day-of-the-month> # required
    hour: <hour-of-the-day> # optional, defaults to 0
    minute: <minute-of-the-hour> # optional, defaults to 0
```

### Yearly Schedule

With a `yearly` schedule, you can run a job on a specific day of the year at a specified time.

- **`month`**: _`required`_ - Month of the year (1-12).
- **`day`**: _`optional`_ - Day of the month 1-31. (defaults to 1)
- **`hour`**: _`optional`_ - Hour of the day in 24-hour format (defaults to 0).
- **`minute`**: _`optional`_ - Minute of the hour (defaults to 0).

```yaml
schedule:
  type: yearly
  params:
    month: <month-oof-the-year> # required
    day: <day-of-the-month> # optional, defaults to 1
    hour: <hour-of-the-day> # optional, defaults to 0
    minute: <minute-of-the-hour> # optional, defaults to 0
```

## Configuration Example

Below is an example of how to configure the `lambda-cron` plugin for the `dev` stage:

### TypeScript Example

```typescript
{
  service: 'aws-serverless-typescript-project',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'lambda-cron'],
  provider: {
    name: 'aws',
  },
  functions: {
    hello,
    books
  },
  custom: {
    'lambda-cron': {
      dev: {
        books: {
          schedule: {
            type: 'interval',
            params: {
              unit: 'minute',
              duration: 2,
            },
          },
          input: {
            key: 'value',
          },
        },
      },
    },
  },
}
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

custom:
  lambda-cron:
    dev:
      books:
        schedule:
          type: monthly
          params:
            day: 2
            hour: 2
            minute: 2
        input:
          key: value
```

