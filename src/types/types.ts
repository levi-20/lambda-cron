/** @format */

import Serverless from 'serverless';

export interface Functions {
	[key: string]:
		| Serverless.FunctionDefinitionHandler
		| Serverless.FunctionDefinitionImage;
}

export interface PluginConfig {
	[key: string]: PluginConfigItem;
}

export interface PluginConfigItem {
	schedule: RateSchedule | DailySchedule | MonthlySchedule;
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
	daily: {
		hours: number;
		minutes?: number;
	};
}

export interface WeeklySchedule extends CronScheduleBase {
	weekly: {
		day: number;
		hours?: number;
		minutes?: number;
	};
}

export interface MonthlySchedule extends CronScheduleBase {
	monthly: {
		day: number;
		hours?: number;
		minutes?: number;
	};
}
