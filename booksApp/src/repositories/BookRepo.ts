import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { createDynamoDBDocumentClient } from "../clients/createDynamoDbClient.js";
import { bookBodytype } from "../handlers/createBook.js";
import { inputType } from "../handlers/updateBook.js";
import z, { string } from "zod";
import { v4 as uuid } from "uuid";
import {
  PutCommand,
  UpdateCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { BookCache } from "../cache/BookCache.js";
export type Book = { id: string; title: string };

export interface GetBooksResult {
  items: Book[];
  lastEvaluatedKey?: string;
  count: number;
}
export const bookData = z.object({
  title: z.string(),
  bookId: z.string(),
});
export type updateBookSchema = z.infer<typeof bookData>;

export default class BookRepo {
  private cache = new BookCache();

  constructor(private readonly dbClient: DynamoDBClient) {}
  async createBook(bookdata: bookBodytype): Promise<Book> {
    // Talk to Db
    const bookId = uuid();
    const bookItem = {
      PK: "Book",
      SK: `Book#${bookId}`,
      title: bookdata.title,
    };
    const command = new PutCommand({ TableName: "BooksTable", Item: bookItem });
    await this.dbClient.send(command);
    return { id: bookId, title: bookdata.title };
  }
  async updateBook(bookData: updateBookSchema): Promise<Book> {
    //Talk to db
    const updateItem = {
      TableName: "BooksTable",
      Key: {
        PK: "Book",
        SK: `Book#${bookData.bookId}`,
      },
      UpdateExpression: "SET title= :title",
      ExpressionAttributeValues: {
        ":title": bookData.title,
      },
      ReturnValues: "ALL_NEW" as const,
    };

    const command = new UpdateCommand(updateItem);
    const result = await this.dbClient.send(command);

    // Invalidate cache after update
    this.cache.invalidate(`book:${bookData.bookId}`);
    console.log(`🔄 Cache invalidated for book:${bookData.bookId}`);

    return { id: bookData.bookId, title: result.Attributes?.title as string };
  }
  async getBookbyId(bookId: string): Promise<Book> {
    // Check cache first
    const cacheKey = `book:${bookId}`;
    const cached = this.cache.get<Book>(cacheKey);
    if (cached) {
      console.log(`✅ Cache HIT for book:${bookId}`);
      return cached;
    }

    console.log(`❌ Cache MISS for book:${bookId}`);

    // Talk to Db
    const getItem = {
      TableName: "BooksTable",
      Key: {
        PK: "Book",
        SK: `Book#${bookId}`,
      },
    };
    const command = new GetCommand(getItem);
    const result = await this.dbClient.send(command);

    if (!result.Item) {
      throw new Error("Book not found");
    }

    const book = { id: bookId, title: result.Item.title as string };

    // Store in cache
    this.cache.set(cacheKey, book);

    return book;
  }
  async deleteBook(bookId: string): Promise<Book> {
    const delItem = {
      TableName: "BooksTable",
      Key: {
        PK: "Book",
        SK: `Book#${bookId}`,
      },
      ReturnValues: "ALL_OLD" as const,
    };
    const command = new DeleteCommand(delItem);
    //Talk to Db
    const result = await this.dbClient.send(command);

    // Invalidate cache after delete
    this.cache.invalidate(`book:${bookId}`);
    console.log(`🗑️  Cache invalidated for book:${bookId}`);

    return { id: bookId, title: result.Attributes?.title as string };
  }
  async getBook(limit = 50, lastEvaluatedKey?: string): Promise<GetBooksResult> {
    //Talk to Db
    const command = new QueryCommand({
      TableName: "BooksTable",
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": "Book",
      },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey
        ? { PK: "Book", SK: lastEvaluatedKey }
        : undefined,
    });

    const result = await this.dbClient.send(command);

    return {
      items: (result.Items || []).map((item) => ({
        id: item.SK.replace("Book#", ""),
        title: item.title,
      })),
      lastEvaluatedKey: result.LastEvaluatedKey?.SK,
      count: result.Count || 0,
    };
  }
}

export function createBookRepo() {
  const dbClient = createDynamoDBDocumentClient();
  const instance = new BookRepo(dbClient);
  return instance;
}
