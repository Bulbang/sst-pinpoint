import { SSTConfig } from 'sst';
import { PinpointApp, PinpointSmsChannel, SnsTopic,WSAPI } from './stacks/MyStack';

export default {
	config(_input) {
		return {
			name: 'sst-sms-receiving',
			region: 'us-east-1',
		};
	},
	stacks(app) {
		app.stack(PinpointApp).stack(PinpointSmsChannel).stack(SnsTopic).stack(WSAPI);
	},
} satisfies SSTConfig;
