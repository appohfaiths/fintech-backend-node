# Fintech-backend-node

## Introduction
This project is a backend service for a fintech application, built using Node.js and TypeScript. It handles financial transactions, user management, and provides APIs for various operations. The application ensures data integrity and security, with features like idempotency keys to prevent duplicate transactions.

## Setup and Run

### Prerequisites
- Node.js (v18 or higher)
- pnpm (v9 or higher)
- A running instance of a compatible database (e.g., PostgreSQL)
- Zoho Mail account for email notifications

### Steps to Run the Project

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd fintech-backend-node
    ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```
   
3. **Set Environment Variables**:
    Create a `.env` file in the project root and add the environment variables using the .env.example file as a reference.

4. **Run the Application**:
   ```bash
   pnpm run dev
   ```
   
5. **Access the Application**:
    - The application will be accessible at `http://localhost:8080` or the port you specify.
      ![Fintech Backend](/public/application.png)

## Additional Information
- API Documentation: Refer to the API documentation at `http://localhost:8080/api/docs` after running the application for details on available 
  endpoints and their usage.
![Fintech Backend](/public/endpoints.png)
- Read the [Design Choices](/docs/design-choices.md) for more information on the architecture and design decisions.


