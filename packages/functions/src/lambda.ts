import { SNSHandler } from 'aws-lambda';

export const handler: SNSHandler = async (_evt) => {
	console.log(typeof _evt);

	console.log(JSON.parse(_evt));
	
  
};
