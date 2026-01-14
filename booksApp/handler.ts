export async function getBook(event: any) {
  console.log("getBook func is called ");
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Showing the BookList",
    }),
  };
}
