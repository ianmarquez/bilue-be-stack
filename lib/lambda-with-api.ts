import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as apiGatewayIntegrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as path from "path";

export interface LambdaWithHttpApiProps {
  lambda: {
    path: string;
    handler: string;
    id: string;
  };
  httpIntegration: {
    id: string;
  };
  environment?: Record<string, string | number>;
}

export default class LambdaWithHttpApi extends Construct {
  public readonly lambdaFunction: lambda.NodejsFunction;
  public readonly httpIntegration: apiGatewayIntegrations.HttpLambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaWithHttpApiProps) {
    super(scope, id);

    this.lambdaFunction = new lambda.NodejsFunction(this, props.lambda.id, {
      entry: path.join(__dirname, props.lambda.path),
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
      handler: props.lambda.handler,
    });

    this.httpIntegration = new apiGatewayIntegrations.HttpLambdaIntegration(
      props.httpIntegration.id,
      this.lambdaFunction,
    );

    if (props.environment) {
      for (const [key, value] of Object.entries(props.environment)) {
        this.lambdaFunction.addEnvironment(
          key,
          typeof value === "string" ? value : value.toString(),
        );
      }
    }
  }
}
