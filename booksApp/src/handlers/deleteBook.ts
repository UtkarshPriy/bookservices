import { BookModel, createBookmodel } from "../models/BookModel.js";

class DeleteBookHandler {
  constructor(private readonly bookModel: BookModel) {}
  async processEvent(event: any) {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    if (typeof body.id === "string") {
      const data = await this.bookModel.deleteBook(body.id);
      console.log("book Deleted");
      console.log(body.id);

      return {
        statusCode: 200,
        body: JSON.stringify({ data: data }),
      };
    } else {
      throw Error("ID is not in required format");
    }
  }
}

export async function deleteBook(event: any) {
  try {
    const bookModelInstance = createBookmodel();
    const instance = new DeleteBookHandler(bookModelInstance);
    return instance.processEvent(event);
  } catch (error) {
    console.error("Error", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: "Internal Error" }),
    };
  }
}
