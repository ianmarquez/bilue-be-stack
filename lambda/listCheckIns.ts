import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const tableName = process.env.CHECK_IN_TABLE_NAME;

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const eventId = event.pathParameters?.id;

    if (!eventId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Malformed url, missing eventId in path",
        }),
      };
    }

    const result = await ddb.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "eventId = :eventId",
        ExpressionAttributeValues: {
          ":eventId": { S: eventId },
        },
      }),
    );

    const users = (result.Items ?? []).map((item) => item.userId);

    if (users.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "No users found registered in the event",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        eventId,
        users,
      }),
    };
  } catch (err) {
    console.error("Error: ", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
