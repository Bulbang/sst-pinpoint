import { SNSHandler } from 'aws-lambda';
import { ApiGatewayManagementApi, DynamoDB } from 'aws-sdk';
import { Table } from 'sst/node/table';

const managementApi = new ApiGatewayManagementApi({
	endpoint: process.env.WSURL?.replace('wss', 'https'),
});

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: SNSHandler = async (event) => {
	console.log('EVENT BELLOW');

	await Promise.all(
		event.Records.map(async (record) => {
			console.log(JSON.stringify(record.Sns));

			const { Message } = record.Sns;

			const messageObj = JSON.parse(Message) as {
				originationNumber: string;
				destinationNumber: string;
				messageKeyword: string;
				messageBody: string;
				inboundMessageId: string;
			};

			const { Items: terminals } = await dynamoDb
				.scan({
					TableName: Table.Connections.tableName,
				})
				.promise();

			if (!terminals) {
				throw new Error('No connection');
			}

			await Promise.all(
				terminals.map(async ({id}) => {
					try {
						await managementApi
							.postToConnection({
								ConnectionId: id,
								Data: messageObj.messageBody,
							})
							.promise();
					} catch (error) {
						console.error(error);

						await dynamoDb
							.delete({
								TableName: Table.Connections.tableName,
								Key: {
									id,
								},
							})
							.promise();
					}
				})
			);
		})
	);
};
