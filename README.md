# User Management API

This project is a Node.js REST API for managing user operations, including user registration, login, password management, and profile image updates. The API is built using TypeScript, Express.js, and InversifyJS for dependency injection.

## Table of Contents

- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Code Highlights](#code-highlights)
- [Dependency Injection](#dependency-injection)
- [Authentication and Authorization](#authentication-and-authorization)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Deployment](#deployment)

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

##

Please note that this is a high-level overview, and you may need to dive deeper into the specific code files and functions to fully understand the implementation details.
