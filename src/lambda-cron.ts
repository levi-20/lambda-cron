/** @format */

import Serverless from 'serverless';
import { Functions, Hooks, PluginConfig } from './types';

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

	private beforePackage() {
		if (!this.hasCronJobs) {
			this.log(`No cron job configurations for stage ${this.stage}`);
		}

		try {
			const config = this.pluginConfig[this.stage];
		} catch (error: any) {
			throw error;
		}
	}
}
