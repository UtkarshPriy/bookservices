import { BookModel, createBookmodel } from "../models/BookModel.js";
import z from "zod";

class getBookbyIdHandler {
  constructor(private readonly bookModel: BookModel) {}
  async processEvent(event: any) {
    // const body = JSON.parse(event.body);
    const id = event.pathParameters.id;
    console.log(id);
    if (typeof id !== "string") {
      throw Error("Invalid Id format ");
    }
    const book = await this.bookModel.getBookbyId(id);
    return {
      statusCode: 200,
      body: JSON.stringify(book),
    };
  }
}

export async function getBookbyId(event: any) {
  try {
    const bookModelInstance = createBookmodel();
    const instance = new getBookbyIdHandler(bookModelInstance);
    return await instance.processEvent(event);
  } catch (error: any) {
    console.error("Error fetching book:", error);

    // Determine appropriate status code based on error
    let statusCode = 500;
    let message = "Internal server error";

    if (error.message === "Book not found") {
      statusCode = 404;
      message = "Book not found";
    } else if (error.message === "Invalid Id format") {
      statusCode = 400;
      message = "Invalid book ID format";
    }

    return {
      statusCode,
      body: JSON.stringify({
        error: message,
        details: error.message,
      }),
    };
  }
}
