export async function updateBook(event: any) {
  console.log("Book Updated");
  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Book Updated!" }),
  };
}
