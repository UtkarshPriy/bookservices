/**
 * SQS Worker Lambda Handler
 *
 * Processes book operation messages from SQS queue
 *
 * Interview Topics:
 * - Batch processing for efficiency
 * - Error handling and retry logic
 * - Dead Letter Queue (DLQ) for failed messages
 * - Idempotency (handling duplicate messages)
 * - Partial batch failures
 */

import { SQSEvent, SQSBatchResponse } from "aws-lambda";
import { PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { createDynamoDBDocumentClient } from "../clients/createDynamoDbClient.js";
import { BookMessage } from "../clients/sqsClient.js";

const dbClient = createDynamoDBDocumentClient();

export async function sqsWorker(event: SQSEvent): Promise<SQSBatchResponse> {
  console.log(`📥 Processing ${event.Records.length} SQS messages`);

  const batchItemFailures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    try {
      const message: BookMessage = JSON.parse(record.body);
      console.log(`Processing ${message.action} action for message ${record.messageId}`);

      switch (message.action) {
        case "CREATE":
          await handleCreate(message.data);
          break;

        case "UPDATE":
          await handleUpdate(message.data);
          break;

        case "DELETE":
          await handleDelete(message.data);
          break;

        default:
          console.warn(`Unknown action: ${message.action}`);
      }

      console.log(`✅ Successfully processed message ${record.messageId}`);
    } catch (error) {
      console.error(`❌ Failed to process message ${record.messageId}:`, error);

      // Add to batch failures - this message will be retried
      batchItemFailures.push({
        itemIdentifier: record.messageId,
      });
    }
  }

  // Return failed message IDs so SQS can retry them
  return {
    batchItemFailures,
  };
}

async function handleCreate(data: any) {
  const command = new PutCommand({
    TableName: "BooksTable",
    Item: data,
    // Conditional check to prevent duplicate inserts (idempotency)
    ConditionExpression: "attribute_not_exists(SK)",
  });

  await dbClient.send(command);
  console.log(`📚 Book created: ${data.SK}`);
}

async function handleUpdate(data: any) {
  const command = new UpdateCommand({
    TableName: "BooksTable",
    Key: {
      PK: data.PK,
      SK: data.SK,
    },
    UpdateExpression: "SET title = :title",
    ExpressionAttributeValues: {
      ":title": data.title,
    },
    // Ensure item exists before updating
    ConditionExpression: "attribute_exists(SK)",
  });

  await dbClient.send(command);
  console.log(`📝 Book updated: ${data.SK}`);
}

async function handleDelete(data: any) {
  const command = new DeleteCommand({
    TableName: "BooksTable",
    Key: {
      PK: data.PK,
      SK: data.SK,
    },
  });

  await dbClient.send(command);
  console.log(`🗑️  Book deleted: ${data.SK}`);
}
