# Design Choices Explanation

## Data Validation
- Input Validation: Validate all incoming data to ensure that it meets the expected format and constraints.

## Error Handling
- Consistent Error Responses: Ensure that all error responses follow a consistent format, making it easier for clients to handle errors.
- Detailed Error Messages: Provide detailed error messages to help with debugging, but avoid exposing sensitive information.

## Security
- Password Hashing: Use strong hashing algorithms like bcrypt to securely store user passwords.
- Token Expiry: Ensure that tokens (e.g., email verification tokens) have an expiration time to reduce the risk of misuse.

## Scalability
- Modular Code Structure: Organize the codebase into modules to make it easier to maintain and scale.

## Idempotency Keys
Idempotency keys are used to ensure that a particular operation is not performed more than once. This is particularly important in financial transactions where duplicate operations can lead to issues such as double charging or incorrect balances.

### Preventing Duplicate Transactions
- The idempotency key is checked before processing a transaction to ensure that the same transaction is not executed multiple times. This is done by querying the `transactionRepository` to see if a transaction with the same idempotency key already exists.
- If a transaction with the same idempotency key is found, the server responds with a status indicating that the transaction has already been processed, preventing duplicate operations.

### Setting the Idempotency Key
- If the idempotency key is not provided in the request, a new unique key is generated using `uuidv4()`. This ensures that each transaction has a unique identifier, which can be used to check for duplicates in future requests.

### Response Headers
- When a duplicate transaction is detected, the response includes a header `Idempotent-Replayed` set to `true`. This informs the client that the request was a replay of a previous transaction.

## Example Code Snippet
```typescript
const existingTransactionByIdempotencyKey = await transactionRepository.findOneBy({ idempotencyKey });
if (existingTransactionByIdempotencyKey) {
    res.set('Idempotent-Replayed', "true");
    res.status(400).json({
        message: "This transaction already exists",
        data: {
            ...existingTransactionByIdempotencyKey,
        },
        code: 400,
    });
    return;
}
```

## Documentation
- API Documentation: Provide detailed documentation for all API endpoints, including request/response formats and error codes using Swagger.