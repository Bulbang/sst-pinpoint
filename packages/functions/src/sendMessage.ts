import { ApiGatewayManagementApi, DynamoDB } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { Table } from 'sst/node/table';

const managementApi = new ApiGatewayManagementApi({
	endpoint: process.env.WSURL?.replace('wss', 'https'),
});

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
	console.log(event.body);
	const domain = event.requestContext.domainName;
	const stage = event.requestContext.stage;
	const callbackUrl = `https://${domain}/${stage}`;
	console.log(callbackUrl);

	const { message, terminalId } = JSON.parse(event.body!);
	console.log(terminalId);

	const { Items: terminals } = await dynamoDb
		.query({
			TableName: Table.Connections.tableName,
			IndexName: 'GSI1',
			KeyConditionExpression: 'terminalId = :t',
			ExpressionAttributeValues: {
				':t': terminalId,
			},
		})
		.promise();

	if (!terminals?.length) {
		return {
			statusCode: 404,
			body: 'NOT FOUND',
		};
	}

	console.log(terminals.length);

	await Promise.all(
		terminals.map(async (terminal) => {
			const { id } = terminal;

			console.log(id);

			try {
				await managementApi
					.postToConnection({
						ConnectionId: id,
						Data: message,
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
	return { statusCode: 200, body: 'Message sent' };
};
