# User Management API

This project is a Node.js REST API for managing user operations, including user registration, login, password management, and profile image updates. The API is built using TypeScript, Express.js, and InversifyJS for dependency injection.

## Table of Contents

- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Code Highlights](#code-highlights)
- [Dependency Injection](#dependency-injection)
- [Authentication and Authorization](#authentication-and-authorization)
- [Error Handling](#error-handling)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Acknowledgments](#acknowledgments)
- [API Reference](#api-reference)

## Project Structure

```
project/
├── src/
│   ├── constants/
│   ├── controllers/
│   │   └── UserController.ts
│   ├── middlewares/
│   │   └── CustomMiddleware.ts
│   ├── models/
│   │   ├── user/
│   │   │   ├── NewUserRequest.ts
│   │   │   └── User.ts
│   ├── service/
│   │   └── UserService.ts
│   ├── utils/
│   │   └── UploadUtil.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

## API Endpoints

| Method | Endpoint                        | Description                                                                                                                         |
| ------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| POST   | /user                           | Handles the creation of a new user. Includes uploading a profile image and validating user data.                                    |
| POST   | /user/login                     | Handles user login requests. Checks if a user with the provided email exists and verifies the password.                             |
| POST   | /user/updatepassword            | Handles the update of a user's password. Requires authentication and validates the new password.                                    |
| POST   | /user/forgotpassword            | Handles the process of forgotten password. Sends a password reset email to the user's registered email address.                     |
| POST   | /user/resetpassword/:token      | Handles the password reset process for a user. Requires a password and a token. Verifies the token and updates the user's password. |
| GET    | /user/get-current-user          | Handles the retrieval of the current user's information. Requires authentication.                                                   |
| PATCH  | /user/update-user-profile-image | Handles user profile image updates. Requires authentication and validates the uploaded image.                                       |

## Code Highlights

- UserController.ts: Contains the implementation of the API endpoints for user management.
- CustomMiddleware.ts: Contains custom middleware for authentication and authorization.
- NewUserRequest.ts: Defines the structure of the request body for creating a new user.
- User.ts: Defines the structure of the user model.
- UserService.ts: Contains the business logic for user operations, such as creating a new user, updating a user's password, and retrieving user information.
- UploadUtil.ts: Contains utility functions for file uploads, such as configuring Multer middleware for handling image uploads.

## Dependency Injection

InversifyJS is used for dependency injection in this project. The container is configured in the `index.ts` file, and the dependencies are injected into the controllers, services, and other components as needed.

## Authentication and Authorization

Custom middleware, such as `CustomMiddleware.ts`, is used for authentication and authorization. The middleware checks if the user is authenticated and authorized to access the requested endpoint.

## Error Handling

Error handling is implemented throughout the API. If an error occurs during user registration, login, password management, or profile image updates, appropriate error messages are returned to the client.

## Installation

To install the project, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/ChiragParmar07/Server.git
```

2. Navigate to the project directory:

```bash
cd Server
```

3. Install the dependencies:

```bash
npm install
```

## Running the Project

To run the project, follow these steps:

1. Start the development server:

```bash
npm start
```

The server will start listening on port 5050 by default. You can access the API endpoints by navigating to `http://localhost:5050` in your browser.

## Features

- Use JSON Web Tokens (JWT) for secure authentication and authorization.
- Implement rate limiting to prevent abuse and protect against brute-force attacks.
- Implement email verification for new user registrations.
- Implement password hashing and salting to securely store user passwords.
- Implement logging and error tracking to help with debugging and monitoring.
- Implement a comprehensive documentation and API reference for developers.

## Technologies Used

- Node.js: A popular JavaScript runtime for building server-side applications.
- TypeScript: A statically-typed superset of JavaScript that compiles to plain JavaScript.
- Express.js: A popular web framework for building APIs in Node.js.
- InversifyJS: A powerful and lightweight dependency injection framework for TypeScript.
- Multer: A middleware for handling file uploads in Express.js.
- Jest or Mocha: Popular testing frameworks for writing unit and integration tests in Node.js.
- MongoDB or PostgreSQL: A popular NoSQL or SQL database for storing user data.

## Acknowledgments

- If you find this project helpful or inspiring, please consider starring the repository and sharing it with your friends and colleagues.
- If you have any questions or need assistance, please don't hesitate to reach out.

## API Reference

#### Create a new user

```http
POST /user
```

| Parameter      | Type     | Description                                                                                                                                                 |
| :------------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`         | `string` | **Required**. The user's full name.                                                                                                                         |
| `userName`     | `string` | **Required**. The user name. Must be unique.                                                                                                                |
| `gender`       | `string` | **Required**. The user's gender.                                                                                                                            |
| `email`        | `string` | **Required**. The user's email address. Must be unique and in a valid format.                                                                               |
| `password`     | `string` | **Required**. The user's password.Must be at least 8 characters long and contain a mix of uppercase and lowercase letters, numbers, and special characters. |
| `profileImage` | `file`   | The user's profile image. Must be a valid image file (e.g., JPG, PNG).                                                                                      |

#### User login

```http
POST /user/login
```

| Parameter  | Type     | Description                             |
| :--------- | :------- | :-------------------------------------- |
| `email`    | `string` | **Required**. The user's email address. |
| `password` | `string` | **Required**. The user's password.      |

#### Update user password

```http
POST /user/updatepassword
```

| Parameter          | Type     | Description                                                                                                                                                      |
| :----------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `email`            | `string` | **Required**. The user's email address.                                                                                                                          |
| `current_password` | `string` | **Required**. The user's current password.                                                                                                                       |
| `new_password`     | `string` | **Required**. The user's new password. Must be at least 8 characters long and contain a mix of uppercase and lowercase letters, numbers, and special characters. |

#### Forgot password

```http
POST /user/forgotpassword
```

| Parameter | Type     | Description                             |
| :-------- | :------- | :-------------------------------------- |
| `email`   | `string` | **Required**. The user's email address. |

#### Reset password

```http
POST /user/resetpassword/:token
```

| Parameter  | Type     | Description                                                                                                                                                      |
| :--------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `password` | `string` | **Required**. The user's new password. Must be at least 8 characters long and contain a mix of uppercase and lowercase letters, numbers, and special characters. |
| `token`    | `string` | **Required**. The password reset token sent to the user's email address.                                                                                         |

#### Get current logged in user information

```http
GET /user/get-current-user
```

| Parameter       | Type     | Description                                                                                                    |
| :-------------- | :------- | :------------------------------------------------------------------------------------------------------------- |
| `Authorization` | `string` | **Required**. The user's JWT token. Must be included in the request header as `Authorization: Bearer <token>`. |

#### Update user profile image

```http
PATCH /user/update-user-profile-image
```

| Parameter       | Type     | Description                                                                                                    |
| :-------------- | :------- | :------------------------------------------------------------------------------------------------------------- |
| `Authorization` | `string` | **Required**. The user's JWT token. Must be included in the request header as `Authorization: Bearer <token>`. |
| `profile_image` | `file`   | **Required**. The new user's profile image. Must be a valid image file (e.g., JPG, PNG).                       |
