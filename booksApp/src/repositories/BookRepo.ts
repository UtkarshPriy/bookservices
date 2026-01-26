import { bookBodytype } from "../handlers/createBook.js";
import { inputTye } from "../handlers/updateBook.js";
export type Book = { id: string; title: string };
export default class BookRepo {
  constructor() {}
  async createBook(bookdata: bookBodytype): Promise<Book> {
    // Talk to Db
    return { id: "kjend", title: "dnc" };
  }
  async updateBook(bookId: inputTye): Promise<Book> {
    //Talk to db
    return { id: "kjend", title: "ThreeBoat" };
  }
  async getBookbyId(bookId: string): Promise<Book> {
    //Talk to Db
    return { id: "kjend", title: "ThreeBoat" };
  }
}

export function createBookRepo() {
  const instance = new BookRepo();
  return instance;
}
