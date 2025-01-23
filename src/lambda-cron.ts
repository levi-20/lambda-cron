/** @format */

import Serverless from 'serverless';
import {
	DailySchedule,
	Functions,
	Hooks,
	MonthlySchedule,
	PluginConfig,
	PluginConfigItem,
	RateSchedule,
} from './types';
import Aws from 'serverless/plugins/aws/provider/awsProvider';
import {
	scheduleDaily,
	scheduleInterval,
	scheduleMonthly,
} from './lib/cron-rates';

export const CONFIG_ROOT_KEY = 'lambdaCronJobs';
export const BEFORE_PACKAGE_HOOK = 'before:package:initialize';

export default class LambdaCronJobs {
	functions: Functions;
	service: any;
	provider: any;
	log: any;
	pluginConfig: PluginConfig;
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
		this.pluginConfig = serverless.service?.custom[CONFIG_ROOT_KEY];
		this.hooks = { [BEFORE_PACKAGE_HOOK]: () => this.beforePackage() };
	}

	private hasCronJobs() {
		return !!(this.pluginConfig && this.stage in this.pluginConfig);
	}

	private getStageConfig() {
		this.config = this.pluginConfig[this.stage];
	}

	private beforePackage() {
		if (!this.hasCronJobs) {
			this.log(`No cron job configurations for stage ${this.stage}`);
		}

		this.getStageConfig();
		this.log(this.config);

		for (let functionName in this.config) {
			this.addCronSchedule(functionName, this.config[functionName]);
		}
		try {
		} catch (error: any) {
			throw error;
		}
	}

	private addCronSchedule(
		functionName: string,
		cronJobConfig: PluginConfigItem
	) {
		const currentFunction = this.functions[functionName];
		currentFunction.events = currentFunction.events ?? [];
		const cronSchedules: Aws.Event[] = this.schedule(cronJobConfig);

		currentFunction.events = [...currentFunction.events, ...cronSchedules];
	}

	private schedule(cronJobConfig: PluginConfigItem) {
		const rate = this.getRate(cronJobConfig.schedule);
		if (!rate) return [];
		return [
			{
				schedule: {
					rate: rate,
					input: cronJobConfig?.input,
				},
			},
		];
	}

	private getRate(rate: RateSchedule | DailySchedule | MonthlySchedule) {
		if (Object.keys(rate).length > 1)
			throw 'cron can be scheduled with only one of these: rate , daily, monthly';
		if ('rate' in rate) return scheduleInterval(rate.rate as any);
		else if ('daily' in rate) return scheduleDaily(rate.daily as any);
		else if ('mothly' in rate) return scheduleMonthly(rate.monthly);
		else {
			this.log('Skipping Cron schedule');
		}
	}
}
