import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as apiGateway from "aws-cdk-lib/aws-apigatewayv2";
import * as apiGatewayIntegrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as path from "path";

export class BilueStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const checkInTable = new dynamoDb.TableV2(this, "CheckInTable", {
      partitionKey: { name: "eventId", type: dynamoDb.AttributeType.STRING },
      sortKey: { name: "userId", type: dynamoDb.AttributeType.STRING },
    });

    const createCheckInLambda = new lambda.NodejsFunction(
      this,
      "createCheckInHandler",
      {
        entry: path.join(__dirname, "../lambda/createCheckIn.ts"),
        runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
        handler: "handler",
      },
    );
    const createHttpIntegration =
      new apiGatewayIntegrations.HttpLambdaIntegration(
        "CreateIntegration",
        createCheckInLambda,
      );
    checkInTable.grantReadWriteData(createCheckInLambda);
    createCheckInLambda.addEnvironment(
      "CHECK_IN_TABLE_NAME",
      checkInTable.tableName,
    );

    const listCheckInsLambda = new lambda.NodejsFunction(
      this,
      "listCheckInsHandler",
      {
        entry: path.join(__dirname, "../lambda/listCheckIns.ts"),
        runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
        handler: "handler",
      },
    );

    const listHttpIntegration =
      new apiGatewayIntegrations.HttpLambdaIntegration(
        "ListIntegration",
        listCheckInsLambda,
      );
    checkInTable.grantReadData(listCheckInsLambda);
    listCheckInsLambda.addEnvironment(
      "CHECK_IN_TABLE_NAME",
      checkInTable.tableName,
    );

    const checkInApi = new apiGateway.HttpApi(this, "CheckInApi");

    checkInApi.addRoutes({
      path: "/checkin",
      methods: [apiGateway.HttpMethod.POST],
      integration: createHttpIntegration,
    });

    checkInApi.addRoutes({
      path: "/checkin/{id}",
      methods: [apiGateway.HttpMethod.GET],
      integration: listHttpIntegration,
    });

    new cdk.CfnOutput(this, "HttpApiUrl", {
      value: checkInApi.apiEndpoint ?? "Error creating HTTP API",
    });
  }
}
