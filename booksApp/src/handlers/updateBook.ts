import { BookModel, createBookmodel } from "../models/BookModel.js";
import { createBookRepo } from "../repositories/BookRepo.js";
import z from "zod";
export const inputSchema = z.object({ id: z.string() });
export type inputTye = z.infer<typeof inputSchema>;
class updateBookHandler {
  constructor(private readonly bookModel: BookModel) {}
  async processEvent(event: any) {
    const body = JSON.parse(event.body);
    // Validate
    const safeInput = inputSchema.parse(body);

    const updatedData = await this.bookModel.updateBook(safeInput);

    console.log(updatedData, safeInput);

    return {
      statusCode: 201,
      body: JSON.stringify({ data: updatedData }),
    };
  }
}

export async function updateBook(event: any) {
  try {
    const bookModelInstance = createBookmodel();
    const instance = new updateBookHandler(bookModelInstance);
    return instance.processEvent(event);
  } catch (error) {
    console.log("Some error while updating");
  }
}
