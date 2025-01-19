/** @format */

export const dailyAt = (dailyTime: number) => {
	return `cron(0 ${dailyTime} * * ? *)`;
};

// export const every = (time: number, rate: any) {

// }
