/** @format */

import Serverless from 'serverless';
import { Functions, Hooks, PluginConfig } from './types';

export const CONFIG_ROOT_KEY = 'lambdaCronJobs';
export const BEFORE_PACKAGE_HOOK = 'before:package:initialize';

export default class LambdaCronJobs {
	functions: Functions;
	provider: any;
	log: any;
	pluginConfig: PluginConfig;
	hooks: Hooks;

	constructor(serverless: Serverless, options: Serverless.Options) {
		// this.log = log;
		this.functions = serverless.service?.functions;
		this.provider = serverless.getProvider('aws');
		this.pluginConfig = serverless.service?.custom[CONFIG_ROOT_KEY];
		this.hooks = { [BEFORE_PACKAGE_HOOK]: () => this.beforePackage() };
	}

	private beforePackage() {
		this.log.info('plugin hook called');
	}
}
