import { SSTConfig } from 'sst';
import { API, PinpointApp } from './stacks/MyStack';

export default {
	config(_input) {
		return {
			name: 'sst-sms-receiving',
			region: 'us-east-1',
		};
	},
	stacks(app) {
		app.stack(API).stack(PinpointApp);
	},
} satisfies SSTConfig;
