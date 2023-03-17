import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { Table } from 'sst/node/table';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
	const terminalId = event.queryStringParameters!.terminalId!;

	const params = {
		TableName: Table.Connections.tableName,
		Item: {
			id: event.requestContext.connectionId,
            terminalId: terminalId
		},
	};

	await dynamoDb.put(params).promise();

	return { statusCode: 200, body: 'Connected' };
};
