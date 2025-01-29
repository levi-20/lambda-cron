/** @format */

import Serverless from 'serverless';
import Aws from 'serverless/plugins/aws/provider/awsProvider';

const CONFIG_KEY = 'lambda-cron';
const BEFORE_PACKAGE_HOOK = 'before:package:initialize';
interface Functions {
	[key: string]:
		| Serverless.FunctionDefinitionHandler
		| Serverless.FunctionDefinitionImage;
}

interface PluginConfiguration {
	[key: string]: PluginConfigurationObject;
}
interface PluginConfigurationObject {
	schedule: CronScheduleBase;
	input: Record<any, unknown>;
}

interface Hooks {
	[key: string]: () => void;
}
enum CrontType {
	'daily',
	'interval',
	'monthly',
	'weekly',
}
interface CronScheduleBase {
	type: CrontType;
	params: Interval | Daily | Weekly | Monthly;
}

interface Interval {
	unit: string;
	duration: number;
}

interface Daily {
	hour: number;
	minute?: number;
}
interface Weekly {
	day: string;
	hour?: number;
	minute?: number;
}

interface Monthly {
	day: number;
	hour?: number;
	minute?: number;
}

const ALLOWED_INTERVAL_UNIT = ['day', 'hour', 'minute'];
const ALLOWED_DAYS = [
	'sunday',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
];

enum DAYS {
	'sunday' = 1,
	'monday' = 2,
	'tuesday' = 3,
	'wednesday' = 4,
	'thursday' = 5,
	'friday' = 6,
	'saturday' = 7,
}
export default class LambdaCronJobs {
	functions: Functions;
	service: any;
	provider: any;
	log: any;
	pluginConfig: PluginConfiguration;
	hooks: Hooks;
	stage: string;
	config: any;

	constructor(
		serverless: Serverless,
		options: Serverless.Options,
		{ log }: any
	) {
		this.log = log;
		this.service = serverless.service;
		this.functions = serverless.service?.functions;
		this.stage = options?.stage ?? serverless.service.provider?.stage;
		this.provider = serverless.getProvider('aws');
		this.pluginConfig = serverless.service?.custom[CONFIG_KEY];
		this.hooks = { [BEFORE_PACKAGE_HOOK]: () => this.beforePackage() };
	}

	private hasCronJobs() {
		return !!(this.pluginConfig && this.stage in this.pluginConfig);
	}

	private getStageConfig() {
		this.config = this.pluginConfig[this.stage];
	}

	private beforePackage() {
		try {
			if (!this.hasCronJobs()) {
				this.log(`No cron job configurations found for stage ${this.stage}`);
				return;
			}

			this.getStageConfig();
			this.log(this.config);

			for (let functionName in this.config) {
				this.addCronSchedule(functionName, this.config[functionName]);
			}
		} catch (error: any) {
			throw error;
		}
	}

	private addCronSchedule(
		functionName: string,
		cronJobConfig: PluginConfigurationObject
	) {
		const currentFunction = this.functions[functionName];
		currentFunction.events = currentFunction.events ?? [];
		const cronSchedules: Aws.Event[] = this.getScheduleEvent(cronJobConfig);
		// Added scheduled event to lambda
		currentFunction.events = [...currentFunction.events, ...cronSchedules];
	}

	private getScheduleEvent(cronJobConfig: PluginConfigurationObject) {
		const rate = this.schedule(cronJobConfig.schedule);
		if (!rate) return [];
		return [
			{
				schedule: {
					rate: [rate],
					input: cronJobConfig?.input,
				},
			},
		];
	}

	private schedule(schedule: CronScheduleBase) {
		if (!schedule) throw new Error('schedule can not be empty');

		switch (schedule.type) {
			case CrontType.interval:
				return this.scheduleInterval(schedule.params as Interval);
			case CrontType.daily:
				return this.scheduleDaily(schedule.params as Daily);
			case CrontType.weekly:
				return this.scheduleWeekly(schedule.params as Weekly);
			case CrontType.monthly:
				return this.scheduleMonthly(schedule.params as Monthly);
			default:
				throw new Error(
					'Invalid Type: cron can be scheduled with only given types: "interval", "daily", "weekly", "monthly"'
				);
		}
	}

	private scheduleInterval(interval: Interval) {
		if (!interval?.unit || !interval?.duration)
			throw new Error(
				'both "unit", "duration" are required for interval schedule'
			);
		else if (interval.unit && typeof interval.unit != 'string')
			throw new Error('Type Error: interval unit must be a number');
		else if (!ALLOWED_INTERVAL_UNIT.includes(interval.unit))
			throw new Error(
				'Invalid Unit: Invalid Unit provided.valid units are: ' +
					ALLOWED_INTERVAL_UNIT.toString()
			);
		else if (interval.duration && typeof interval.duration != 'number')
			throw new Error('Type Error: interval duration must be a number');

		return `rate(${interval.duration} ${interval.unit})`;
	}

	private scheduleDaily = (daily: Daily) => {
		if (!daily?.hour)
			throw new Error('Missing param: hour is required for daily schedule');

		if (typeof daily.hour != 'number')
			throw new Error('Type Error: hour must be a number');

		if (daily.minute) {
			if (typeof daily.minute != 'number')
				throw new Error('Type Error: minute must be a number');
		} else {
			console.log('minute is not provided in params default value is set to 0');
		}

		const hours = daily.hour;
		const minutes = daily?.minute ?? 0;
		return `cron(${minutes} ${hours} * * ? *)`;
	};

	private scheduleWeekly(weekly: Weekly) {
		if (!weekly?.day)
			throw new Error('day is required for Weekly schedule to at given day');

		if (typeof weekly.day != 'string')
			throw new Error('Type Error: day must be a string');

		if (!ALLOWED_DAYS.includes(weekly.day.toLowerCase()))
			throw new Error(
				'Invalid param: invalid day passed. Allowed values are: ' +
					ALLOWED_DAYS.toString()
			);
		if (weekly.hour) {
			if (typeof weekly.hour != 'number')
				throw new Error('Type Error: hour must be a number');
		} else
			console.log('hour is not provided in params default value is set to 0');

		if (weekly.minute) {
			if (typeof weekly.minute != 'number')
				throw new Error('Type Error: minute must be a number');
		} else
			console.log('minute is not provided in params default value is set to 0');

		const day = weekly.day;
		const hours = weekly?.hour ?? 0;
		const minutes = weekly?.minute ?? 0;
		return `cron(${minutes} ${hours} ? * ${day} *)`;
	}

	private scheduleMonthly(monthly: Monthly) {
		if (!monthly?.day)
			throw new Error(
				'day is required for monthly schedule to schedule for a given day'
			);

		if (typeof monthly.day != 'number')
			throw new Error('Type Error: day must be a number for monthly schedule');

		if (monthly.day < 0 || monthly.day > 31)
			throw new Error(
				'Invalid param: invalid day passed. Allowed values are: ' +
					ALLOWED_DAYS.toString()
			);
		if (monthly.hour) {
			if (typeof monthly.hour != 'number')
				throw new Error('Type Error: hour must be a number');
		} else
			console.log('hour is not provided in params default value is set to 0');

		if (monthly.minute) {
			if (typeof monthly.minute != 'number')
				throw new Error('Type Error: minute must be a number');
		} else
			console.log('minute is not provided in params default value is set to 0');

		const day = monthly?.day ?? 0;
		const hours = monthly?.hour ?? 0;
		const minutes = monthly?.minute ?? 0;
		return `cron(${minutes} ${hours} ${day} * ? *)`;
	}
}
