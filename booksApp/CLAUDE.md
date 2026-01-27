# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Deploy Commands

- **Build TypeScript:** `npx tsc` (compiles `src/` to `dist/`)
- **Local development:** `npx serverless offline` (runs Lambda functions locally via serverless-offline plugin)
- **Deploy to AWS:** `npx serverless deploy`
- **Deploy single function:** `npx serverless deploy function -f <functionName>`
- **Invoke function locally:** `npx serverless invoke local -f <functionName>`

No test framework is configured yet.

## Architecture

Serverless Framework v4 application on AWS (Node.js 20.x, region ap-south-1) implementing a Books CRUD microservice. Uses HTTP API Gateway (v2).

### Layered Architecture

```
handlers/ → models/ → repositories/ → clients/ → DynamoDB
```

- **Handlers** (`src/handlers/`): Lambda entry points. Parse/validate input using Zod schemas, delegate to model layer, return HTTP responses.
- **Models** (`src/models/BookModel.ts`): Business logic layer wrapping repository calls.
- **Repositories** (`src/repositories/BookRepo.ts`): Data access layer using AWS SDK v3 DynamoDB DocumentClient commands.
- **Clients** (`src/clients/createDynamoDbClient.ts`): Factory for DynamoDB DocumentClient instance.

Each layer uses factory functions for instantiation (e.g., `createBookmodel()`, `createBookRepo()`, `createDynamoDBDocumentClient()`).

### DynamoDB Schema

- **Table:** BooksTable
- **PK** (partition key): `"Book"` (static string for all books)
- **SK** (sort key): `"Book#<uuid>"` (unique per book)
- **Attributes:** title (string)

### API Endpoints

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | /getBook | getBook | List all books |
| POST | /createBook | createBook | Create a book |
| GET | /getBookbyId/{id} | getBookbyId | Get book by ID |
| POST | /updateBook | updateBook | Update a book |
| DELETE | /getBook | deleteBook | Delete a book |

### Key Dependencies

- **@aws-sdk/client-dynamodb** + **@aws-sdk/lib-dynamodb**: DynamoDB access
- **zod**: Input validation in handlers
- **uuid**: Book ID generation
- **serverless-esbuild**: Bundles Lambda functions for deployment

### TypeScript Configuration

ES module project (`"type": "module"` in package.json). Uses `nodenext` module resolution, `es6` target, strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` enabled.
