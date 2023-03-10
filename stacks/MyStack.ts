import { StackContext, Api,  } from "sst/constructs";
import * as pinpoint from '@aws-cdk/aws-pinpoint'
import * as cdk from 'aws-cdk-lib'
import {Construct} from '@aws-cdk/core'


export function API({ stack }: StackContext) {
  const api = new Api(stack, "api", {
    routes: {
      "GET /": "packages/functions/src/lambda.handler",
    },
  });
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

export function PinpointApp ({stack, app}: StackContext) {
  const pinpointApp = new pinpoint.CfnApp(stack as any, "app",{
    name: `${stack.stackName}`
  })
}