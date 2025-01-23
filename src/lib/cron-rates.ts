/** @format */

import { Daily, Monthly, Rate } from '../types';

export const scheduleInterval = (rate: Rate) => {
	if ('runRate' in rate && 'interval' in rate) {
		return `rate( ${rate.interval} ${rate.runRate})`;
	}
	return '';
};

export const scheduleDaily = (daily: Daily) => {
	const hours = daily?.hours ?? 0;
	const minutes = daily?.minutes ?? 0;
	return `cron(${minutes} ${hours} * * ? *)`;
};

export const scheduleMonthly = (monthly: Monthly) => {
	const day = monthly?.day ?? 0;
	const hours = monthly?.hours ?? 0;
	const minutes = monthly?.minutes ?? 0;
	return `cron(${minutes} ${hours} ${day} * ? *)`;
};
