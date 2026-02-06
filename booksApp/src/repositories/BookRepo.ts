import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
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
} from "@aws-sdk/lib-dynamodb";
export type Book = { id: string; title: string };
export const bookData = z.object({
  title: z.string(),
  bookId: z.string(),
});
export type updateBookSchema = z.infer<typeof bookData>;

export default class BookRepo {
  constructor(private readonly dbClient: DynamoDBClient) {}
  async createBook(bookdata: bookBodytype): Promise<Book> {
    // Talk to Db
    const bookItem = {
      PK: "Book",
      SK: `Book#${uuid()}`,
      title: bookdata.title,
    };
    const command = new PutCommand({ TableName: "BooksTable", Item: bookItem });
    await this.dbClient.send(command);
    return { id: "kme", title: bookdata.title };

    // return { id: "kjend", title: "dnc" };
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
    return { id: bookData.bookId, title: result.Attributes?.title as string };
  }
  async getBookbyId(bookId: string): Promise<Book> {
    //Talk to Db
    const getItem = {
      TableName: "BooksTable",
      Key: {
        PK: "Book",
        SK: `Book#${bookId}`,
      },
    };
    const command = new GetCommand(getItem);
    const result = await this.dbClient.send(command);
    return { id: bookId, title: result.Item?.title as string };
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
    return { id: bookId, title: result.Attributes?.title as string };
  }
  async getBook(): Promise<any> {
    //Talk to Db
    return { id: "kjend", title: "ThreeBoat" };
  }
}

export function createBookRepo() {
  const dbClient = createDynamoDBDocumentClient();
  const instance = new BookRepo(dbClient);
  return instance;
}
