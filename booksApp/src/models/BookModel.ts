import { bookBodytype } from "../handlers/createBook.js";
import { inputType } from "../handlers/updateBook.js";
import BookRepo, {
  Book,
  createBookRepo,
  updateBookSchema,
} from "../repositories/BookRepo.js";
export class BookModel {
  constructor(private readonly bookRepo: BookRepo) {}
  async createBook(bookData: bookBodytype): Promise<Book> {
    return this.bookRepo.createBook(bookData);
  }
  async updateBook(bookData: updateBookSchema): Promise<Book> {
    return await this.bookRepo.updateBook(bookData);
  }
  async getBookbyId(bookId: string): Promise<Book> {
    return await this.bookRepo.getBookbyId(bookId);
  }
  async deleteBook(bookId: string): Promise<Book> {
    return await this.bookRepo.deleteBook(bookId);
  }
  async getBook(): Promise<Book> {
    return await this.bookRepo.getBook();
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
