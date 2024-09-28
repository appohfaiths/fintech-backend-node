# Design Choices Explanation

## Data Validation
- Input Validation: All incoming data is validated to ensure that it meets the expected format and constraints.

## Error Handling
- Consistent Error Responses: All error responses follow a consistent format, making it easier for clients to handle errors.
- Detailed Error Messages: Detailed error messages to help with debugging without exposing sensitive information.

## Security
- Password Hashing: Using strong hashing algorithms from bcrypt to securely store user passwords.
- Token Expiry: All tokens (e.g., email verification tokens) have an expiration time to reduce the risk of misuse.

## Scalability
- Modular Code Structure: Codebase is organised into modules to make it easier to maintain and scale.

## Idempotency Keys
Idempotency keys are used to ensure that a particular operation is not performed more than once. This is to ensure duplicate operations which can lead to 
issues such as double charging or incorrect balances is avoided.

### Preventing Duplicate Transactions
- The idempotency key is checked before processing a transaction to ensure that the same transaction is not executed multiple times. This is done by querying the `transactionRepository` to see if a transaction with the same idempotency key already exists.
- If a transaction with the same idempotency key is found, the server responds with a status indicating that the transaction has already been processed and returns the details of the existing transaction, preventing duplicate operations.

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
