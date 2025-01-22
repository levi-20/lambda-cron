/** @format */

import Serverless from 'serverless';

export interface Functions {
	[key: string]:
		| Serverless.FunctionDefinitionHandler
		| Serverless.FunctionDefinitionImage;
}
export interface PluginConfigItem {
	rate: Rate;
	input?: Record<string, unknown>;
}

export interface PluginConfig {
	[key: string]: {
		[key: string]: PluginConfigItem[];
	};
}

export interface FunctionCronJobConfig {
	functionName: string;
	cronJobConfig: PluginConfigItem[];
}

export type SlsLog = Serverless[];

export interface Rate {
	time: number;
	rate: RateString;
}

export enum RateString {
	'minute',
	'hour',
	'month',
}

export interface Hooks {
	[key: string]: () => void;
}
