import { StackContext, Api, Topic, use } from 'sst/constructs';
import * as pinpoint from 'aws-cdk-lib/aws-pinpoint';

export function PinpointApp({ stack, app }: StackContext) {
	const { ref } = new pinpoint.CfnApp(stack, 'app', {
		name: `${stack.stackName}`,
	});

	return { ref };
}

export function PinpointSmsChannel({ stack }: StackContext) {
	const { ref } = use(PinpointApp);

	const smsChannel = new pinpoint.CfnSMSChannel(stack, 'MyCfnSMSChannel', {
		applicationId: ref,
	});
}

export function SnsTopic({ stack }: StackContext) {
	const snsTopic = new Topic(stack, 'topic', {
		subscribers: {
			subscriber1: 'packages/functions/src/lambda.handler',
		},
	});
}
