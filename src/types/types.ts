/** @format */

import Serverless from 'serverless';

export interface Functions {
	[key: string]:
		| Serverless.FunctionDefinitionHandler
		| Serverless.FunctionDefinitionImage;
}

export interface PluginConfiguration {
	[key: string]: PluginConfigurationObject;
}

export interface PluginConfigurationObject {
	schedule: RateSchedule | DailySchedule | WeeklySchedule | MonthlySchedule;
	input: Record<any, unknown>;
}

export interface Hooks {
	[key: string]: () => void;
}

export interface CronScheduleBase {
	rate?: Rate;
	daily?: Daily;
	weekly?: Weekly;
	monthly?: Monthly;
}

export interface Rate {
	runRate: string;
	internal: number;
}

export interface Daily {
	hours: number;
	minutes?: number;
}
export interface Weekly {
	day: number;
	hours?: number;
	minutes?: number;
}

export interface Monthly {
	day: number;
	hours?: number;
	minutes?: number;
}
export interface RateSchedule extends CronScheduleBase {
	rate: Rate;
}

export interface DailySchedule extends CronScheduleBase {
	daily: Daily;
}

export interface WeeklySchedule extends CronScheduleBase {
	weekly: Weekly;
}

export interface MonthlySchedule extends CronScheduleBase {
	monthly: Monthly;
}
