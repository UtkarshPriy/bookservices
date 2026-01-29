import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export function createDynamoDBDocumentClient() {
  const client = new DynamoDBClient();
  const dbdocumentClient = DynamoDBDocumentClient.from(client);
  return dbdocumentClient;
}
