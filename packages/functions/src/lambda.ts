import { SNSHandler } from 'aws-lambda';

export const handler: SNSHandler = async (_evt) => {
	console.log( _evt);
	
  
};
