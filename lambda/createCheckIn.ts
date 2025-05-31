import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

type CheckInPayload = {
  eventId: string;
  userId: string;
};

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const tableName = process.env.CHECK_IN_TABLE_NAME;

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" }),
      };
    }

    const { eventId, userId } = JSON.parse(
      event.body ?? "{}",
    ) as Partial<CheckInPayload>;

    if (!eventId || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Malformed request body" }),
      };
    }

    const isExisting = await ddb.send(
      new GetItemCommand({
        TableName: tableName,
        Key: {
          eventId: { S: eventId },
          userId: { S: userId },
        },
      }),
    );

    if (isExisting.Item) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          error: "User already checked in for this event",
        }),
      };
    }

    await ddb.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          eventId: eventId,
          userId: userId,
          timeStamp: Date.now(),
        },
      }),
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Check-in created",
        data: { eventId, userId },
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
