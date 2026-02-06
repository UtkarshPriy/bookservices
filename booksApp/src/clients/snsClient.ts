/**
 * SNS Client for Event Notifications
 *
 * Interview Topics:
 * - Pub/Sub pattern
 * - Fan-out architecture (one event, multiple subscribers)
 * - Event-driven architecture
 * - Message filtering with attributes
 * - Loose coupling between services
 */

import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: process.env.AWS_REGION || "ap-south-1" });

export interface BookEvent {
  type: "BookCreated" | "BookUpdated" | "BookDeleted";
  bookId: string;
  title: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Publish an event to SNS topic
 * @param topicArn - SNS topic ARN
 * @param event - Book event
 * @returns Message ID from SNS
 */
export async function publishEvent(topicArn: string, event: BookEvent) {
  try {
    const command = new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify(event),
      Subject: event.type,
      MessageAttributes: {
        eventType: {
          DataType: "String",
          StringValue: event.type,
        },
        bookId: {
          DataType: "String",
          StringValue: event.bookId,
        },
      },
    });

    const result = await snsClient.send(command);
    console.log(`📢 Published event ${event.type}: ${result.MessageId}`);
    return result;
  } catch (error) {
    console.error("Failed to publish event to SNS:", error);
    throw error;
  }
}
