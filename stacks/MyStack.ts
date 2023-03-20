import {
	StackContext,
	Api,
	Topic,
	use,
	WebSocketApi,
	Table,
} from 'sst/constructs';
import * as pinpoint from 'aws-cdk-lib/aws-pinpoint';
import * as iot from 'aws-cdk-lib/aws-iot';

iot.CfnPolicy;

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
	const { table, wsApi } = use(WSAPI);
	const snsTopic = new Topic(stack, 'topic', {
		defaults: {
			function: {
				permissions: ['execute-api', 'dynamodb'],
				bind: [table],
				environment: {
					WSURL: wsApi.url,
				},
			},
		},
		subscribers: {
			subscriber1: 'packages/functions/src/lambda.handler',
		},
	});
}

export function WSAPI({ stack }: StackContext) {
	const table = new Table(stack, 'Connections', {
		fields: {
			id: 'string',
			terminalId: 'string',
		},
		primaryIndex: { partitionKey: 'id' },
		globalIndexes: {
			GSI1: {
				partitionKey: 'terminalId',
			},
		},
	});

	const wsApi = new WebSocketApi(stack, 'Api', {
		defaults: {
			function: {
				bind: [table],
				permissions: ['dynamodb', 'execute-api'],
			},
		},
		routes: {
			$connect: 'packages/functions/src/connect.handler',
			$disconnect: 'packages/functions/src/disconnect.handler',
		},
	});

	const api = new Api(stack, 'api', {
		defaults: {
			function: {
				bind: [table],
				environment: {
					WSURL: wsApi.url,
				},
				permissions: ['dynamodb', 'execute-api'],
			},
		},
		routes: {
			'POST /sendMessage': 'packages/functions/src/sendMessage.handler',
		},
	});

	stack.addOutputs({
		wsApi: wsApi.url,
		ApiEndpoint: api.url,
	});

	return { table, wsApi };
}
