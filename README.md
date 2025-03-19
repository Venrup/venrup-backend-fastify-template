# Venrup Backend Fastify Template
This repository contains the starter code for the Venrup backend projects, built with Fastify, PostgreSQL, Drizzle ORM, Zod, and TypeScript.

## Features

- Organized project structure
- Database integration with PostgreSQL using Drizzle ORM
- Swagger integration
- JWT-based authentication setup
- User authentication and authorization
- Refresh token management
- Authentication module
- User module
- prettier setup
- Eslint setup
- Pre-configured package.json with common scripts & dependencies
- GitHub Actions for linting and type checking
- Zod integration for runtime validation
- Simple zod .env validator
- Request and response schemas defined in Swagger
- Error handling

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or later)
- npm (v6 or later)
- PostgreSQL database

## Installation

1. Clone the repository:
   ```
   git clone git@github.com:Venrup/venrup-backend-fastify-template.git
   cd venrup-backend-fastify-template
   ```

2. Install dependencies:
   ```
   yarn
   ```

3. Create a `.env` file in the root directory by copying the .env.example and updating it with the required environment variables:
   ```
   cp .env.example .env
   ```

## Database Setup

1. Run database migrations:
   ```
   yarn db:generate
   yarn db:migrate
   ```

## Running the Application

To run the application in development mode:
   ```
   yarn dev
   ```


The server will start on `http://localhost:8000` by default.


## Database Schema

The database schema includes tables for users and refresh tokens. For detailed schema information, refer to the `schema.ts` file in the `src/db` directory.
