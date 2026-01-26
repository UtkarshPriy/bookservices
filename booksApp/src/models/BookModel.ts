import { bookBodytype } from "../handlers/createBook.js";
import { inputTye } from "../handlers/updateBook.js";
import BookRepo, { Book, createBookRepo } from "../repositories/BookRepo.js";
export class BookModel {
  constructor(private readonly bookRepo: BookRepo) {}
  async createBook(bookData: bookBodytype): Promise<Book> {
    return this.bookRepo.createBook(bookData);
  }
  async updateBook(bookId: inputTye): Promise<Book> {
    return await this.bookRepo.updateBook(bookId);
  }
  async getBookbyId(bookId: string): Promise<Book> {
    return await this.bookRepo.getBookbyId(bookId);
  }
}

export function createBookmodel() {
  const repoInstance = createBookRepo();
  const instance = new BookModel(repoInstance);
  return instance;
}

//
//  Handler -- (safeBody)  Model        -- (bookData)     Repo

// reverse// createModel              createbookRepo
