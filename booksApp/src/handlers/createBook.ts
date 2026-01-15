export async function createBook(event: any) {
  console.log("Book Created");
  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Book Created!" }),
  };
}
