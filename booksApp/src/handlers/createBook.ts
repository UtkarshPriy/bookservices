import z, { string } from "zod";
import { BookModel, createBookmodel } from "../models/BookModel.js";

const bookSchema = z.object({
  title: z.string(),
});

export type bookBodytype = z.infer<typeof bookSchema>;

class CreateBookHandler {
  constructor(private readonly bookModel: BookModel) {}

  async processEvent(event: any) {
    console.log("Book Created");

    // Validation of body
    const body = JSON.parse(event.body);
    const safeBody = bookSchema.parse(body);
    // BookModel(safeBody);
    const book = await this.bookModel.createBook(safeBody);

    return {
      statusCode: 201,
      body: JSON.stringify({ data: book }),
    };
  }
}

export async function createBook(event: any) {
  try {
    const bookModelInstance = createBookmodel();
    const instance = new CreateBookHandler(bookModelInstance);

    return await instance.processEvent(event);
  } catch (error) {
    console.error("Error", error);
    return {
      statusCode: 501,
      body: JSON.stringify({
        msg: "Some error happened while creating the book",
      }),
    };
  }
}
