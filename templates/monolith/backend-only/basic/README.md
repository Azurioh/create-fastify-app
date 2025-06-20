# {{PROJECT_NAME}}

This is a basic backend-only template for a monolithic application built with Fastify.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository and navigate to the project directory.

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the project and add the following environment variables:

   ```
   NODE_ENV=development
   PORT=3000
   API_BASE_URL=http://localhost:3000
   ```

4.  Build and run the services using Docker Compose:

    ```bash
    docker-compose --env-file .env up --build
    ```

### Running the application

- **Development mode:**

  This will start the server with hot-reloading.

  ```bash
  npm run dev
  ```

- **Production mode:**

  First, you need to build the TypeScript code:

  ```bash
  npm run build
  ```

  Then, start the server:

  ```bash
  npm start
  ```

The server will be running at `http://localhost:3000` (or the port you specified in your `.env` file). 