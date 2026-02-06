/**
 * SQS Client for Async Message Processing
 *
 * Interview Topics:
 * - Async messaging patterns
 * - Decoupling producers from consumers
 * - At-least-once delivery guarantee
 * - Message attributes for filtering
 * - Dead Letter Queue (DLQ) handling
 */

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({ region: process.env.AWS_REGION || "ap-south-1" });

export interface BookMessage {
  action: "CREATE" | "UPDATE" | "DELETE";
  data: any;
  timestamp: string;
  requestId?: string;
}

/**
 * Publish a message to SQS queue
 * @param queueUrl - SQS queue URL
 * @param message - Book operation message
 * @returns Message ID from SQS
 */
export async function publishToQueue(queueUrl: string, message: BookMessage) {
  try {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message),
      MessageAttributes: {
        action: {
          DataType: "String",
          StringValue: message.action,
        },
        timestamp: {
          DataType: "String",
          StringValue: message.timestamp,
        },
      },
    });

    const result = await sqsClient.send(command);
    console.log(`📤 Published to SQS: ${result.MessageId} (${message.action})`);
    return result;
  } catch (error) {
    console.error("Failed to publish to SQS:", error);
    throw error;
  }
}
