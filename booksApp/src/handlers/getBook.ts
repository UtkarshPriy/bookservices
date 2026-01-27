import { BookModel, createBookmodel } from "../models/BookModel.js";

class getBookHandler {
  constructor(private readonly bookModel: BookModel) {}
  async processEvent(event: any) {
    // const body = event.body ? JSON.parse(event.body) : null;
    const data = await this.bookModel.getBook();
    return {
      statusCode: 200,
      body: JSON.stringify({ books: data }),
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
