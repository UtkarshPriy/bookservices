export async function deleteBook(event: any) {
  console.log("Book Deleted");
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Book deleted" }),
  };
}
