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
    const book = this.bookModel.getBookbyId(id);
  }
}

export async function getBookbyId(event: any) {
  try {
    const bookModelInstance = createBookmodel();
    const instance = new getBookbyIdHandler(bookModelInstance);
    return instance.processEvent(event);
  } catch (error) {
    console.log(error);
  }
  console.log("Book details supplied");
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Book details here" }),
  };
}
