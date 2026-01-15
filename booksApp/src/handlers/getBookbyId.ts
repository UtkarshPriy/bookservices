export async function getBookbyId(event: any) {
  console.log("Book details supplied");
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Book details here" }),
  };
}
