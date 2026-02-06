/**
 * DynamoDB Streams Processor
 *
 * Automatically captures ALL database changes and publishes events
 *
 * Interview Topics:
 * - CDC (Change Data Capture)
 * - Event sourcing
 * - Audit trail/logging
 * - Decoupling business logic from event publishing
 * - Stream record types (INSERT, MODIFY, REMOVE)
 */

import { DynamoDBStreamEvent } from "aws-lambda";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { publishEvent } from "../clients/snsClient.js";

export async function streamProcessor(event: DynamoDBStreamEvent) {
  console.log(`🌊 Processing ${event.Records.length} DynamoDB stream records`);

  for (const record of event.Records) {
    try {
      console.log(`Event: ${record.eventName} on ${record.eventID}`);

      if (!record.dynamodb) {
        console.warn("No dynamodb data in record");
        continue;
      }

      // Skip if no SNS topic configured
      if (!process.env.BOOK_EVENTS_TOPIC_ARN) {
        console.warn("SNS topic ARN not configured, skipping event publishing");
        continue;
      }

      switch (record.eventName) {
        case "INSERT": {
          const newImage = unmarshall(record.dynamodb.NewImage as Record<string, AttributeValue>);

          await publishEvent(process.env.BOOK_EVENTS_TOPIC_ARN, {
            type: "BookCreated",
            bookId: newImage.SK.replace("Book#", ""),
            title: newImage.title,
            timestamp: new Date().toISOString(),
            metadata: {
              source: "dynamodb-stream",
              streamEventId: record.eventID,
            },
          });
          break;
        }

        case "MODIFY": {
          const newImage = unmarshall(record.dynamodb.NewImage as Record<string, AttributeValue>);
          const oldImage = unmarshall(record.dynamodb.OldImage as Record<string, AttributeValue>);

          await publishEvent(process.env.BOOK_EVENTS_TOPIC_ARN, {
            type: "BookUpdated",
            bookId: newImage.SK.replace("Book#", ""),
            title: newImage.title,
            timestamp: new Date().toISOString(),
            metadata: {
              source: "dynamodb-stream",
              streamEventId: record.eventID,
              oldTitle: oldImage.title,
              changed: newImage.title !== oldImage.title,
            },
          });
          break;
        }

        case "REMOVE": {
          const oldImage = unmarshall(record.dynamodb.OldImage as Record<string, AttributeValue>);

          await publishEvent(process.env.BOOK_EVENTS_TOPIC_ARN, {
            type: "BookDeleted",
            bookId: oldImage.SK.replace("Book#", ""),
            title: oldImage.title,
            timestamp: new Date().toISOString(),
            metadata: {
              source: "dynamodb-stream",
              streamEventId: record.eventID,
            },
          });
          break;
        }

        default:
          console.warn(`Unknown event type: ${record.eventName}`);
      }

      console.log(`✅ Processed stream record ${record.eventID}`);
    } catch (error) {
      console.error(`❌ Failed to process stream record ${record.eventID}:`, error);
      // Don't throw - continue processing other records
    }
  }

  console.log("Stream processing complete");
}
