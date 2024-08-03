import { inject } from 'inversify';
import { controller, httpGet, httpPatch, httpPost } from 'inversify-express-utils';
import { Request, Response } from 'express';
import moment from 'moment';
import TYPES from '../../constants/types.constants';
import { UserService } from '../../service/user/user.service';
import { NewUserRequest } from '../../models/user/new-user-request.model';
import { UploadUtil } from '../../utils/upload/upload.util';
import { CustomMiddleware } from '../../middlewares/custom.middleware';
import { User } from '../../models/user/user.model';
import { ValidationUtil } from '../../utils/validation/validation.util';

@controller('/user')
export class UserController {
  private userService: UserService;

  constructor(@inject(TYPES.UserService) userService: UserService) {
    this.userService = userService;
  }

  /**
   * Handles the creation of a new user.
   * This method processes the incoming request to create a new user, including uploading a profile image,
   * parsing the request body, checking for existing users with the same email or userName or phone number, and creating the user if no conflicts are found.
   *
   * @param request - The request object containing the user data and uploaded profile image.
   * @param response - The response object used to send back the HTTP response.
   * @returns A promise that resolves with the HTTP response indicating the outcome of the operation.
   * @throws Will throw an error if a user with the provided email already exists or if any other error occurs during the process.
   */
  @httpPost('/', UploadUtil.uploadImage())
  public async createUser(request: Request, response: Response): Promise<any> {
    try {
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: ***** Received a request to create a new user. *****`);

      // Checks if the request contains a valid profile image.
      request.body.profileImage = request.file
        ? { key: request.file['key'], location: request.file['location'], originalname: request.file.originalname }
        : {};

      // Parses the request body to create a NewUserRequest object.
      const newUserRequest: NewUserRequest = NewUserRequest.parseJson(request.body);

      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: Checking user is already exits or not.`);
      // Checks whether a user with the provided email already exists.
      const existingUser = await UserService.getUserByEmail(newUserRequest.email);

      // If a user with the provided email already exists, checks for existing users with the same username or phone number.
      if (existingUser) {
        const errorMessage =
          existingUser.userName === newUserRequest.userName
            ? 'username'
            : existingUser.phone === newUserRequest.phone
              ? 'phone number'
              : 'email address';

        console.log(
          `${moment().format('YYYY-MM-DD HH:mm:ss')}: ***** User with this ${errorMessage} already exists. *****`
        );

        // Delete profile image if user upload an profile image
        await this.userService.deleteUploadedProfileImage(request?.file);

        return response.status(409).json({
          status: 'failed',
          message: `User with this ${errorMessage} already exists`,
        });
      }

      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: Validating user inputs...`);
      // Check user inputs are valid or not
      const invalidPayloadMessage = ValidationUtil.validateUserCreateRequest(newUserRequest);

      if (invalidPayloadMessage) {
        console.log(
          `${moment().format('YYYY-MM-DD HH:mm:ss')}: ***** User inputs are not correct. Stopping the execution. *****`
        );

        // Delete profile image if user upload an profile image
        await this.userService.deleteUploadedProfileImage(request?.file);

        return response.status(400).json({
          status: 'fail',
          message: 'User inputs are not correct',
          data: invalidPayloadMessage,
        });
      }

      // Creates the new user and generates a token.
      const result = await this.userService.createUser(newUserRequest);

      console.log(
        `${moment().format('YYYY-MM-DD HH:mm:ss')}: ***** User created successfully sending the response. *****`
      );

      // Returns a success response with the generated token.
      return response.status(201).json({
        status: 'success',
        message: 'User created successfully.',
        data: result,
      });
    } catch (error: any) {
      // Delete profile image if user upload an profile image
      await this.userService.deleteUploadedProfileImage(request?.file);

      // Handle duplicate value error
      if (error?.code === 11000) {
        const key = Object.keys(error.keyPattern)[0];

        console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: ***** User with this ${key} already exists. *****`);

        return response.status(409).json({
          status: 'failed',
          message: `User with this ${key} already exists`,
        });
      }

      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: ***** Error occurs while creating user *****\n`, error);

      return response.status(400).json({
        status: 'failed',
        message: 'Error occurs while creating user' + error?.message,
      });
    }
  }

  /**
   * Handles user login requests.
   * This method checks if a user with the provided email exists. If the user exists, it attempts to log the user in with the provided password.
   * On successful login, it returns a token. If the user does not exist or the login fails, it throws an error.
   *
   * @param request The request object, containing the user's login credentials.
   * @param response The response object used to send back the HTTP response.
   * @returns A promise that resolves with the HTTP response containing the login status and token on success.
   */
  @httpPost('/login')
  public async loginUser(request: Request, response: Response) {
    try {
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: ***** Receive a request for login user. *****`);

      const { email, password } = request.body;

      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: Checking user is exists or not.`);
      // Check wheather user is already exists or not
      const existingUser = await UserService.getUserByEmail(email);

      if (!existingUser) {
        console.log(
          `${moment().format('YYYY-MM-DD HH:mm:ss')}: ***** Can't find user with this email address ${email}. *****`
        );

        return response.status(401).json({
          status: 'failed',
          message: 'User not found with this email address.',
        });
      }

      // Attempt to log the user in and generate a token
      const token = await this.userService.loginUser(existingUser, password);

      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: ***** User logged in successfully. *****`);

      existingUser.password = null;

      return response.status(200).json({
        status: 'success',
        data: { token, user: existingUser },
      });
    } catch (error: any) {
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: ***** Error while login a user. *****\n`, error);

      return response.status(400).json({
        status: 'failed',
        message: 'Error while login a user' + error.message,
      });
    }
  }

  /**
   * Handles the update of a user's password.
   * This method is protected by a custom authentication middleware that ensures only authenticated users can access it.
   * It expects a payload containing the new password details, validates it, and then updates the user's password in the database.
   * On successful update, it responds with a success message. If the update fails, it responds with an error message.
   *
   * @param request The request object, containing the new password details in the body and the authenticated user's information.
   * @param response The response object used to send back the HTTP response.
   * @returns A promise that resolves with the HTTP response indicating the outcome of the operation.
   */
  @httpPost('/updatepassword', CustomMiddleware.UserAuthMiddleware)
  public async updateUserPassword(request: Request, response: Response) {
    try {
      const payload = User.validateUpdatePasswordPaylod(request.body);
      await this.userService.updateUserPassword(payload, request['currentUser']);

      return response.status(200).json({
        status: 'success',
        message: 'Password update successfully',
      });
    } catch (error: any) {
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: ***** updateUserPassword Error. *****\n`, error);

      return response.status(400).json({
        status: 'failed',
        message: error.message,
      });
    }
  }

  /**
   * Handles the process of forgotten password.
   * This method checks if a user with the provided email exists. If the user exists, it sends a password reset email to the user's registered email address.
   *
   * @param request The request object, containing the user's email address.
   * @param response The response object used to send back the HTTP response.
   * @returns A promise that resolves with the HTTP response containing the outcome of the operation.
   */
  @httpPost('/forgotpassword')
  public async forgotUserPassword(request: Request, response: Response) {
    try {
      const { email } = request?.body;

      // Check wheather user is already exists or not
      const existingUser = await UserService.getUserByEmail(email);
      if (!existingUser) {
        throw new Error(`Can't find user with this email ${email} address. You can register with this email`);
      }

      // Send mail to the user
      await this.userService.forgotUserPassword(existingUser);

      return response.status(200).json({
        status: 'success',
        message: 'Password reset email send successfully. Check your mail box and reset the password',
      });
    } catch (error: any) {
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: ***** Error while forgot password. *****\n`, error);

      return response.status(400).json({
        status: 'failed',
        message: error.message,
      });
    }
  }

  /**
   * Handles the password reset process for a user.
   * This method is called when a user attempts to reset their password using a token received via email.
   * It expects a password and a token in the request. The token is used to verify the user's identity and the password is updated accordingly.
   * On successful password reset, it responds with a success message. If the process fails, it responds with an error message.
   *
   * @param request The request object, containing the new password and the token.
   * @param response The response object used to send back the HTTP response.
   * @returns A promise that resolves with the HTTP response indicating the outcome of the operation.
   */
  @httpPost('/resetpassword/:token')
  public async resetUserPassword(request: Request, response: Response) {
    try {
      await this.userService.resetUserPassword(request.body.password, request.params.token);

      return response.status(200).json({ status: 'success', message: 'Password Reset successfully' });
    } catch (error: any) {
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: ***** Error while reset user password. *****\n`, error);
      return response.status(400).json({
        status: 'failed',
        message: error.message,
      });
    }
  }

  /**
   * Handles the retrieval of the current user's information.
   * This method is protected by a custom authentication middleware that ensures only authenticated users can access it.
   * It retrieves the current user's information from the request object and removes the password for security reasons.
   * On successful retrieval, it responds with the current user's information. If the retrieval fails, it responds with an error message.
   *
   * @param request The request object, containing the current user's information.
   * @param response The response object used to send back the HTTP response.
   * @returns A promise that resolves with the HTTP response containing the current user's information on success, or an error message on failure.
   */
  @httpGet('/get-current-user', CustomMiddleware.UserAuthMiddleware)
  public async getCurrentUser(request: Request, response: Response) {
    try {
      request['currentUser'].password = undefined;
      return response.status(200).json({ status: 'success', data: request['currentUser'] });
    } catch (error: any) {
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: ***** getCurrentUser Error. *****\n`, error);
      return response.status(400).json({
        status: 'failed',
        message: error.message,
      });
    }
  }

  /**
   * Handles user profile image updates.
   *
   * @param request - The request object containing the uploaded profile image.
   * @param response - The response object used to send back the HTTP response.
   * @returns A promise that resolves with the HTTP response indicating the outcome of the operation.
   * @throws Will throw an error if any error occurs during the process.
   */
  @httpPatch('/update-user-profile-image', UploadUtil.uploadImage(), CustomMiddleware.UserAuthMiddleware)
  public async updateUserProfileImage(request: Request, response: Response): Promise<any> {
    try {
      // Extract the uploaded image URL from the request.
      // If no file is uploaded, the profileImage will be an empty object.
      request.body.profileImage = request.file
        ? { key: request.file['key'], location: request.file['location'], originalname: request.file.originalname }
        : {};

      // Update the user's profile image URL in the database.
      await this.userService.updateUserProfileImage(request.body);

      // Return a success response
      return response.status(201).json({
        status: 'success',
        message: 'User`s profile image updated successfully.',
      });
    } catch (error: any) {
      // Log the error and return a failure response with the error message.
      console.log(
        `${moment().format('YYYY-MM-DD HH:mm:ss')}: ***** Error while updating user's profile image. *****\n`,
        error
      );

      return response.status(400).json({
        status: 'failed',
        message: error?.message,
      });
    }
  }
}
