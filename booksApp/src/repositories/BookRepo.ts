import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { createDynamoDBDocumentClient } from "../clients/createDynamoDbClient.js";
import { bookBodytype } from "../handlers/createBook.js";
import { inputTye } from "../handlers/updateBook.js";
import { v4 as uuid } from "uuid";
import { PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
export type Book = { id: string; title: string };
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
  async updateBook(bookId: inputTye): Promise<Book> {
    //Talk to db
    const command = new UpdateCommand({ TableName: "BooksTable", key: {PK:bookId,SK:} });
    return { id: "kjend", title: "ThreeBoat" };
  }
  async getBookbyId(bookId: string): Promise<Book> {
    //Talk to Db
    return { id: "kjend", title: "ThreeBoat" };
  }
  async deleteBook(bookId: string): Promise<Book> {
    //Talk to Db
    return { id: "kjend", title: "ThreeBoat" };
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
