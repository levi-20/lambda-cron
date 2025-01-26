/** @format */

import { ALL } from 'dns';
import { Daily, Monthly, Rate, Weekly } from '../types';

export const ALLOWED_RUN_RATES = [
	'day',
	'days',
	'hour',
	'hours',
	'minute',
	'minutes',
];

export const scheduleInterval = (rate: Rate) => {
	if (ALLOWED_RUN_RATES.includes(rate.runRate))
		throw new Error(
			`runRate can have only one of the following values: ${ALLOWED_RUN_RATES.toString()}`
		);
	if ('runRate' in rate && 'interval' in rate) {
		return `rate(${rate.interval} ${rate.runRate})`;
	}
	return '';
};

export const scheduleDaily = (daily: Daily) => {
	const hours = daily.hours;
	const minutes = daily?.minutes ?? 0;
	return `cron(${minutes} ${hours} * * ? *)`;
};

export const scheduleWeekly = (weekly: Weekly) => {
	if (!weekly?.day)
		throw new Error(
			'in weekly schedule day is required to decide which day of the week job needs to be scheduled'
		);
	const day = weekly.day;
	const hours = weekly?.hours ?? 0;
	const minutes = weekly?.minutes ?? 0;
	return `cron(${minutes} ${hours} ? * ${day} *)`;
};

export const scheduleMonthly = (monthly: Monthly) => {
	if (!monthly?.day)
		throw new Error(
			'in monthly schedule day is required to decide which day of the month job needs to be scheduled'
		);
	const day = monthly?.day ?? 0;
	const hours = monthly?.hours ?? 0;
	const minutes = monthly?.minutes ?? 0;
	return `cron(${minutes} ${hours} ${day} * ? *)`;
};
