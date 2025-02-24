/** @format */
// command : npm run test --silent false --colors
import { describe } from '@jest/globals';
import { BEFORE_PACKAGE_HOOK, CrontType } from './index';
import LambdaCronJobs from './index';
import Serverless from 'serverless';

const getLambdaCronInstance = (schedule: any = null) => {
	const serverlessConfiguration = {
		service: {
			provider: {
				name: 'aws',
				stage: 'dev',
			},
			custom: {
				'lambda-cron': {
					dev: {
						hello: { schedule },
					},
				},
			},
			functions: {
				hello: {
					handler: '.src/handler.hello',
					name: 'hello',
					events: [],
				},
			},
		},
		getProvider: () => ({ name: 'aws' }),
	} as unknown as any;

	return new LambdaCronJobs(serverlessConfiguration as any, {} as any);
};

const slsConfigWithoutPluginConfig = {
	service: {
		provider: {
			name: 'aws',
			stage: 'dev',
		},
	},
	getProvider: () => ({ name: 'aws' }),
} as unknown as any;

describe('Simple Validation', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('No cron config', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
		const lambdaCron = new LambdaCronJobs(
			slsConfigWithoutPluginConfig,
			{} as any
		);
		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy).toHaveBeenCalledWith(
			'No cron job configurations found for stage dev'
		);
	});

	it('Schedule can not be empty', () => {
		const lambdaCron = getLambdaCronInstance();
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('schedule can not be empty');
	});

	it('Schedule type is invalid', () => {
		const lambdaCron = getLambdaCronInstance({ type: 'invalid' });
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow(
			'Invalid schedule type: cron can be scheduled with only given types: "interval", "daily", "weekly", "monthly".'
		);
	});
});

describe('Interval based schedule', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	// for schedule object validation
	it('unit is not provided', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'interval',
			params: {
				duration: 5,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow(
			'Missing param: both "unit", "duration" are required for interval schedule'
		);
	});

	it('duration is not provided', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'interval',
			params: {
				unit: 'minute',
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow(
			'Missing param: both "unit", "duration" are required for interval schedule'
		);
	});

	it('wrong unit type', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'interval',
			params: {
				unit: 2,
				duration: 3,
			},
		});

		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: interval unit must be a string');
	});

	it('wrong unit provided', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'interval',
			params: {
				unit: 'second',
				duration: 4,
			},
		});

		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow(
			'Invalid param: Invalid unit provided. Valid units are: day,hour,minute'
		);
	});

	it('wrong duration type provided', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'interval',
			params: {
				unit: 'minute',
				duration: 'invalid',
			},
		});

		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: interval duration must be a number');
	});

	it('valid schedule cron job for every 20 minute', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'interval',
			params: {
				unit: 'minute',
				duration: 20,
			},
		});
		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy).toHaveBeenCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { unit: 'minute', duration: 20 }, type: 'interval' },
		});
	});
});

describe('Daily Schedule', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	it('Missing param: hour', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'daily',
			params: {},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Missing param: hour is required for daily schedule');
	});

	it('Invalid param: hour is string', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'daily',
			params: {
				hour: '2',
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: hour must be a number be between 0 and 24');
	});

	it('Invalid param: hour less then 0', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'daily',
			params: {
				hour: -1,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: hour must be a number be between 0 and 24');
	});

	it('Invalid param: hour greater than 24', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'daily',
			params: {
				hour: 26,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: hour must be a number be between 0 and 24');
	});

	it('Invalid param: minute is string', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'daily',
			params: {
				hour: 2,
				minute: '2',
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: minute must be a number between 0 and 59');
	});

	it('Invalid param: minute less than 0', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'daily',
			params: {
				hour: 0,
				minute: -1,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: minute must be a number between 0 and 59');
	});

	it('Invalid param: minute greater than 59', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'daily',
			params: {
				hour: 2,
				minute: 61,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: minute must be a number between 0 and 59');
	});

	it('Valid: minute not provided', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'daily',
			params: {
				hour: 2,
			},
		});

		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy).toHaveBeenCalledWith(
			'minute is not provided in params default value is set to 0'
		);
	});

	it('Valid: minute and hour provided', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'daily',
			params: {
				hour: 2,
				minute: 30,
			},
		});

		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy).toHaveBeenCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { hour: 2, minute: 30 }, type: 'daily' },
		});
	});
});

describe('Weekly Schedule', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	it('Missing param: day', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'weekly',
			params: {},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Missing param: day is required for weekly schedule');
	});

	it('Invalid param: day must be string', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'weekly',
			params: {
				day: 2,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: day must be a string');
	});

	it('Invalid param: invalid day passed', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'weekly',
			params: {
				day: 'someday',
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow(
			'Invalid param: invalid day passed. Allowed values are: sunday, monday, tuesday, wednesday, thursday, friday, saturday'
		);
	});

	it('Invalid param: hour is string', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'weekly',
			params: {
				day: 'sunday',
				hour: '2',
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: hour must be a number be between 0 and 24');
	});

	it('Invalid param: hour less then 0', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'weekly',
			params: {
				day: 'sunday',
				hour: -1,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: hour must be a number be between 0 and 24');
	});

	it('Invalid param: hour greater than 24', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'weekly',
			params: {
				day: 'sunday',
				hour: 26,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: hour must be a number be between 0 and 24');
	});

	it('Invalid param: minute is string', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'weekly',
			params: {
				day: 'sunday',
				hour: 2,
				minute: '2',
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: minute must be a number between 0 and 59');
	});

	it('Invalid param: minute less than 0', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'weekly',
			params: {
				day: 'sunday',
				hour: 0,
				minute: -1,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: minute must be a number between 0 and 59');
	});

	it('Invalid param: minute greater than 59', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'weekly',
			params: {
				day: 'sunday',
				hour: 2,
				minute: 61,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: minute must be a number between 0 and 59');
	});

	it('Valid: hour and minute not provided', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'weekly',
			params: {
				day: 'sunday',
			},
		});
		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();

		expect(logSpy.mock.calls).toHaveLength(3);
		expect(logSpy.mock.calls[0][0]).toBe(
			'hour is not provided in params default value is set to 0'
		);
		expect(logSpy.mock.calls[1][0]).toBe(
			'minute is not provided in params default value is set to 0'
		);
		expect(logSpy).toHaveBeenLastCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { day: 'sunday' }, type: 'weekly' },
		});
	});

	it('Valid: minute is not provided', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'weekly',
			params: {
				day: 'sunday',
				hour: 2,
			},
		});
		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy.mock.calls).toHaveLength(2);
		expect(logSpy.mock.calls[0][0]).toBe(
			'minute is not provided in params default value is set to 0'
		);
		expect(logSpy).toHaveBeenCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { day: 'sunday', hour: 2 }, type: 'weekly' },
		});
	});

	it('Valid: hour is not provided', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'weekly' as unknown as CrontType,
			params: {
				day: 'sunday',
				minute: 2,
			},
		});

		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy.mock.calls).toHaveLength(2);
		expect(logSpy).toHaveBeenCalledWith(
			'hour is not provided in params default value is set to 0'
		);
		expect(logSpy).toHaveBeenCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { day: 'sunday', minute: 2 }, type: 'weekly' },
		});
	});

	it('Valid: Every Sunday at 15:45', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'weekly',
			params: {
				day: 'sunday',
				hour: 15,
				minute: 45,
			},
		});
		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy).toHaveBeenCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: {
				params: { day: 'sunday', hour: 15, minute: 45 },
				type: 'weekly',
			},
		});
	});
});

describe('monthly Schedule', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	it('Missing param: day', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'monthly',
			params: {},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Missing param: day is required for monthly schedule');
	});

	it('Invalid param: day must be number', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'monthly',
			params: {
				day: 'sunday',
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow(
			'Invalid param: day must be a number for monthly schedule between 1 and 31'
		);
	});

	it('Invalid param: day less than 1', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'monthly',
			params: {
				day: 0,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow(
			'Invalid param: day must be a number for monthly schedule between 1 and 31'
		);
	});

	it('Invalid param: day greater than 31', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'monthly',
			params: {
				day: 32,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow(
			'Invalid param: day must be a number for monthly schedule between 1 and 31'
		);
	});

	it('Invalid param: hour is string', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'monthly',
			params: {
				day: 2,
				hour: '2',
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: hour must be a number be between 0 and 24');
	});

	it('Invalid param: hour less then 0', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'monthly',
			params: {
				day: 2,
				hour: -1,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: hour must be a number be between 0 and 24');
	});

	it('Invalid param: hour greater than 24', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'monthly',
			params: {
				day: 2,
				hour: 26,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: hour must be a number be between 0 and 24');
	});

	it('Invalid param: minute is string', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'monthly',
			params: {
				day: 2,
				hour: 2,
				minute: '2',
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: minute must be a number between 0 and 59');
	});

	it('Invalid param: minute less than 0', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'monthly',
			params: {
				day: 2,
				hour: 0,
				minute: -1,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: minute must be a number between 0 and 59');
	});

	it('Invalid param: minute greater than 59', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'monthly',
			params: {
				day: 2,
				hour: 2,
				minute: 60,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: minute must be a number between 0 and 59');
	});

	it('Valid: hour and minute not provided', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'monthly' as unknown as CrontType,
			params: {
				day: 3,
			},
		});
		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy.mock.calls).toHaveLength(3);
		expect(logSpy.mock.calls[0][0]).toBe(
			'hour is not provided in params default value is set to 0'
		);
		expect(logSpy.mock.calls[1][0]).toBe(
			'minute is not provided in params default value is set to 0'
		);
		expect(logSpy).toHaveBeenLastCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { day: 3 }, type: 'monthly' },
		});
	});

	it('Valid: minute is not provided', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'monthly' as unknown as CrontType,
			params: {
				day: 2,
				hour: 15,
			},
		});

		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy.mock.calls).toHaveLength(2);
		expect(logSpy.mock.calls[0][0]).toBe(
			'minute is not provided in params default value is set to 0'
		);
		expect(logSpy).toHaveBeenLastCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { day: 2, hour: 15 }, type: 'monthly' },
		});
	});

	it('Valid: hour is not provided', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'monthly',
			params: {
				day: 12,
				minute: 34,
			},
		});

		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy.mock.calls).toHaveLength(2);
		expect(logSpy).toHaveBeenCalledWith(
			'hour is not provided in params default value is set to 0'
		);
		expect(logSpy).toHaveBeenLastCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { day: 12, minute: 34 }, type: 'monthly' },
		});
	});

	it('Valid: Every 15th at 15:45', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'monthly' as unknown as CrontType,
			params: {
				day: 15,
				hour: 15,
				minute: 45,
			},
		});

		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();

		expect(logSpy).toHaveBeenCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { day: 15, hour: 15, minute: 45 }, type: 'monthly' },
		});
	});

	it('Valid: Every 16th at 16:16', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const slsConfigWithFunctionWithoutEvents = {
			service: {
				provider: {
					name: 'aws',
					stage: 'dev',
				},
				custom: {
					'lambda-cron': {
						dev: {
							hello: {
								schedule: {
									type: 'monthly' as unknown as CrontType,
									params: {
										day: 16,
										hour: 16,
										minute: 16,
									},
								},
							},
						},
					},
				},
				functions: {
					hello: {
						handler: '.src/handler.hello',
						name: 'hello',
					},
				},
			},
			getProvider: () => ({ name: 'aws' }),
		} as unknown as any;
		const lambdaCron = new LambdaCronJobs(
			slsConfigWithFunctionWithoutEvents,
			{} as any
		);
		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy).toHaveBeenCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { day: 16, hour: 16, minute: 16 }, type: 'monthly' },
		});
	});
});

describe('Yearly Schedule', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	it('Missing param: month', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Missing param: month is required for yearly schedule');
	});

	it('Invalid param: month must be number', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {
				month: 'jan',
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: month must be a number between 1 and 12');
	});

	it('Invalid param: month less than 1', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {
				month: 0,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: month must be a number between 1 and 12');
	});

	it('Invalid param: month greater than 12', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {
				month: 13,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: month must be a number between 1 and 12');
	});

	it('Invalid param: day must be a number', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {
				month: 1,
				day: 'sun',
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow(
			'Invalid param: day must be a number for yearly schedule between 1 and 31'
		);
	});

	it('Invalid param: day is 0', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {
				month: 1,
				day: 0,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow(
			'Invalid param: day must be a number for yearly schedule between 1 and 31'
		);
	});

	it('Invalid param: day less than 1', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {
				month: 1,
				day: 0,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow(
			'Invalid param: day must be a number for yearly schedule between 1 and 31'
		);
	});

	it('Invalid param: day greater than 31', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {
				month: 3,
				day: 32,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow(
			'Invalid param: day must be a number for yearly schedule between 1 and 31'
		);
	});

	it('Invalid param: day greater than 30 for 30 day month', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {
				month: 4,
				day: 32,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow(
			'Invalid param: day must be a number for yearly schedule between 1 and 30'
		);
	});

	it('Invalid param: day greater than 28 in feb for non leap year', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {
				month: 2,
				day: 32,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow(
			'Invalid param: day must be a number for yearly schedule between 1 and 28'
		);
	});

	it('Invalid param: hour is string', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {
				month: 2,
				day: 2,
				hour: '2',
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: hour must be a number be between 0 and 24');
	});

	it('Invalid param: hour less then 0', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {
				month: 2,
				day: 2,
				hour: -1,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: hour must be a number be between 0 and 24');
	});

	it('Invalid param: hour greater than 24', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {
				month: 2,
				day: 2,
				hour: 26,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: hour must be a number be between 0 and 24');
	});

	it('Invalid param: minute is string', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {
				month: 2,
				day: 2,
				hour: 2,
				minute: '2',
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: minute must be a number between 0 and 59');
	});

	it('Invalid param: minute less than 0', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {
				month: 2,
				day: 2,
				hour: 0,
				minute: -1,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: minute must be a number between 0 and 59');
	});

	it('Invalid param: minute greater than 59', () => {
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {
				month: 2,
				day: 2,
				hour: 2,
				minute: 60,
			},
		});
		expect(() => {
			lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		}).toThrow('Invalid param: minute must be a number between 0 and 59');
	});

	it('Valid: day, hour and minute not provided', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly' as unknown as CrontType,
			params: {
				month: 2,
			},
		});
		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy.mock.calls).toHaveLength(4);
		expect(logSpy.mock.calls[0][0]).toBe(
			'day is not provided in params default value is set to 1st day of the month'
		);
		expect(logSpy.mock.calls[1][0]).toBe(
			'hour is not provided in params default value is set to 0'
		);
		expect(logSpy.mock.calls[2][0]).toBe(
			'minute is not provided in params default value is set to 0'
		);
		expect(logSpy).toHaveBeenLastCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { month: 2 }, type: 'yearly' },
		});
	});

	it('Valid: day and hour not provided', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly' as unknown as CrontType,
			params: {
				month: 2,
				minute: 3,
			},
		});
		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy.mock.calls).toHaveLength(3);
		expect(logSpy.mock.calls[0][0]).toBe(
			'day is not provided in params default value is set to 1st day of the month'
		);
		expect(logSpy.mock.calls[1][0]).toBe(
			'hour is not provided in params default value is set to 0'
		);
		expect(logSpy).toHaveBeenLastCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { month: 2, minute: 3 }, type: 'yearly' },
		});
	});

	it('Valid: day and minute not provided', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly' as unknown as CrontType,
			params: {
				month: 2,
				hour: 3,
			},
		});
		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy.mock.calls).toHaveLength(3);
		expect(logSpy.mock.calls[0][0]).toBe(
			'day is not provided in params default value is set to 1st day of the month'
		);
		expect(logSpy.mock.calls[1][0]).toBe(
			'minute is not provided in params default value is set to 0'
		);
		expect(logSpy).toHaveBeenLastCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { month: 2, hour: 3 }, type: 'yearly' },
		});
	});

	it('Valid: day not provided', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly' as unknown as CrontType,
			params: {
				month: 2,
				hour: 3,
				minute: 10,
			},
		});
		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy.mock.calls).toHaveLength(2);
		expect(logSpy.mock.calls[0][0]).toBe(
			'day is not provided in params default value is set to 1st day of the month'
		);

		expect(logSpy).toHaveBeenLastCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { month: 2, hour: 3, minute: 10 }, type: 'yearly' },
		});
	});

	it('Valid: hour and minute not provided', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly' as unknown as CrontType,
			params: {
				month: 2,
				day: 3,
			},
		});
		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy.mock.calls).toHaveLength(3);
		expect(logSpy.mock.calls[0][0]).toBe(
			'hour is not provided in params default value is set to 0'
		);
		expect(logSpy.mock.calls[1][0]).toBe(
			'minute is not provided in params default value is set to 0'
		);
		expect(logSpy).toHaveBeenLastCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { month: 2, day: 3 }, type: 'yearly' },
		});
	});

	it('Valid: hour is not provided', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly',
			params: {
				month: 2,
				day: 12,
				minute: 34,
			},
		});

		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy.mock.calls).toHaveLength(2);
		expect(logSpy).toHaveBeenCalledWith(
			'hour is not provided in params default value is set to 0'
		);
		expect(logSpy).toHaveBeenLastCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { month: 2, day: 12, minute: 34 }, type: 'yearly' },
		});
	});

	it('Valid: minute is not provided', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance({
			type: 'yearly' as unknown as CrontType,
			params: {
				month: 2,
				day: 2,
				hour: 15,
			},
		});

		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy.mock.calls).toHaveLength(2);
		expect(logSpy.mock.calls[0][0]).toBe(
			'minute is not provided in params default value is set to 0'
		);
		expect(logSpy).toHaveBeenLastCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: { params: { month: 2, day: 2, hour: 15 }, type: 'yearly' },
		});
	});

	it('Valid: Every 29th feb at 15:45 of a leap year', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

		const lambdaCron = getLambdaCronInstance({
			type: 'yearly' as unknown as CrontType,
			params: {
				month: 2,
				day: 29,
				hour: 15,
				minute: 45,
			},
		});
		lambdaCron.isLeapYear = jest.fn().mockImplementationOnce(() => {
			return true;
		});
		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();

		expect(logSpy).toHaveBeenCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: {
				type: 'yearly',
				params: { month: 2, day: 29, hour: 15, minute: 45 },
			},
		});
	});

	it('Valid: Every 16th of Feb at 16:16', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const slsConfigWithFunctionWithoutEvents = {
			service: {
				provider: {
					name: 'aws',
					stage: 'dev',
				},
				custom: {
					'lambda-cron': {
						dev: {
							hello: {
								schedule: {
									type: 'yearly' as unknown as CrontType,
									params: {
										month: 2,
										day: 16,
										hour: 16,
										minute: 16,
									},
								},
							},
						},
					},
				},
				functions: {
					hello: {
						handler: '.src/handler.hello',
						name: 'hello',
					},
				},
			},
			getProvider: () => ({ name: 'aws' }),
		} as unknown as any;
		const lambdaCron = new LambdaCronJobs(
			slsConfigWithFunctionWithoutEvents,
			{} as any
		);
		lambdaCron.hooks[BEFORE_PACKAGE_HOOK]();
		expect(logSpy).toHaveBeenCalledWith('scheduled cron for: ', {
			function: 'hello',
			schedule: {
				params: { month: 2, day: 16, hour: 16, minute: 16 },
				type: 'yearly',
			},
		});
	});

	it('Valid: 2000 is a Leap Year', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance();

		const result = lambdaCron.isLeapYear(2000);
		expect(result).toBe(true);
	});
	
	it('Valid: 2024 is a Leap Year', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance();

		const result = lambdaCron.isLeapYear(2024);
		expect(result).toBe(true);
	});
	
	it('Valid: 1000 is a Leap Year', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance();

		const result = lambdaCron.isLeapYear(1000);
		expect(result).toBe(false);
	});
	
	it('Valid: 2025 is a Leap Year', () => {
		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const lambdaCron = getLambdaCronInstance();

		const result = lambdaCron.isLeapYear(1000);
		expect(result).toBe(false);
	});
});
