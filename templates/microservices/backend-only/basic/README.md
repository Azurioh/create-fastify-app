# {{PROJECT_NAME}}

This is a basic backend-only template for a microservices application built with Fastify and orchestrated with Docker Compose.

## Project Structure

- `app/micro-services`: Contains the individual microservices.
  - `health`: An example health-check microservice.
- `app/docker-compose.yml`: The Docker Compose file for running the services.
- `packages/*`: Shared packages that can be used by the microservices.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- Docker
- Docker Compose

### Installation and Running

The application is designed to be run with Docker Compose.

1.  Navigate to the project root directory.

2.  Install all the dependencies for the workspaces. This is required for your IDE to have the right context and for the Docker build to work correctly as it copies the `node_modules`.

    ```bash
    npm install
    ```

3.  Navigate to the `app` directory:

    ```bash
    cd app
    ```

4.  Create a `.env` file in the `app` directory with the following content:

    ```
    NODE_ENV=development
    API_BASE_URL=http://localhost:3000
    PORT=3000
    ```

5.  Build and run the services using Docker Compose:

    ```bash
    docker-compose --env-file .env up --build
    ```

    This will build the Docker images for each service and start them. The `health` service will be available at `http://localhost:3000`.

### Adding a new microservice

To add a new microservice:

1.  Create a new directory under `app/micro-services`.
2.  Add a `package.json` with a `start` script.
3.  Add your service logic (e.g., `index.ts`).
4.  Add a new service definition to `app/docker-compose.yml`, following the example of the `health` service. 