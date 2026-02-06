import { BookModel, createBookmodel } from "../models/BookModel.js";

class getBookHandler {
  constructor(private readonly bookModel: BookModel) {}
  async processEvent(event: any) {
    // Get pagination parameters from query string
    const limit = event.queryStringParameters?.limit
      ? parseInt(event.queryStringParameters.limit)
      : 50;
    const lastKey = event.queryStringParameters?.lastKey;

    const result = await this.bookModel.getBook(limit, lastKey);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  }
}

export async function getBook(event: any) {
  try {
    const bookModelInstance = createBookmodel();
    const instance = new getBookHandler(bookModelInstance);
    return instance.processEvent(event);
  } catch (error) {
    console.error("Error : ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Some Error happened check log",
      }),
    };
  }
}
