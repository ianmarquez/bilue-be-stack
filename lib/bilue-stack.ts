import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";
import * as apiGateway from "aws-cdk-lib/aws-apigatewayv2";
import LambdaWithHttpApi from "./lambda-with-api";

export class BilueStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const checkInTable = new dynamoDb.TableV2(this, "CheckInTable", {
      partitionKey: { name: "eventId", type: dynamoDb.AttributeType.STRING },
      sortKey: { name: "userId", type: dynamoDb.AttributeType.STRING },
    });
    const checkInApi = new apiGateway.HttpApi(this, "CheckInApi");

    const createCheckIn = new LambdaWithHttpApi(
      scope,
      "CreateCheckInConstruct",
      {
        lambda: {
          id: "createCheckInHandler",
          path: "../lambda/createCheckIn.ts",
          handler: "handler",
        },
        httpIntegration: {
          id: "CreateIntegration",
        },
        environment: {
          CHECK_IN_TABLE_NAME: checkInTable.tableName,
        },
      },
    );
    checkInTable.grantReadWriteData(createCheckIn.lambdaFunction);

    const listCheckIns = new LambdaWithHttpApi(scope, "ListCheckInConstruct", {
      lambda: {
        id: "listCheckInsHandler",
        path: "../lambda/listCheckIns.ts",
        handler: "handler",
      },
      httpIntegration: {
        id: "ListIntegration",
      },
      environment: {
        CHECK_IN_TABLE_NAME: checkInTable.tableName,
      },
    });
    checkInTable.grantReadData(listCheckIns.lambdaFunction);

    checkInApi.addRoutes({
      path: "/checkin",
      methods: [apiGateway.HttpMethod.POST],
      integration: createCheckIn.httpIntegration,
    });

    checkInApi.addRoutes({
      path: "/checkin/{id}",
      methods: [apiGateway.HttpMethod.GET],
      integration: listCheckIns.httpIntegration,
    });

    new cdk.CfnOutput(this, "HttpApiUrl", {
      value: checkInApi.apiEndpoint ?? "Error creating HTTP API",
    });
  }
}
