import { inject } from 'inversify';
import { controller, httpGet, httpPatch, httpPost } from 'inversify-express-utils';
import { Request, Response } from 'express';
import TYPES from '../../constants/types.constants';
import { UserService } from '../../service/user/user.service';
import { NewUserRequest } from '../../models/user/new-user-request.model';
import { UploadUtil } from '../../utils/upload/upload.util';
import { CustomMiddleware } from '../../middlewares/custom.middleware';
import { User } from '../../models/user/user.model';

@controller('/user')
export class UserController {
  private userService: UserService;

  constructor(@inject(TYPES.UserService) userService: UserService) {
    this.userService = userService;
  }

  /**
   * Handles the creation of a new user.
   * This method processes the incoming request to create a new user, including uploading a profile image,
   * parsing the request body, checking for existing users with the same email, and creating the user if no conflicts are found.
   *
   * @param request - The request object containing the user data and uploaded profile image.
   * @param response - The response object used to send back the HTTP response.
   * @returns A promise that resolves with the HTTP response indicating the outcome of the operation.
   * @throws Will throw an error if a user with the provided email already exists or if any other error occurs during the process.
   */
  @httpPost('/', UploadUtil.uploadImage())
  public async createUser(request: Request, response: Response): Promise<any> {
    try {
      console.log('-> Received request to create a new user.');
      request.body.profileImageUrl = request.file
        ? { key: request.file['key'], location: request.file['location'], originalname: request.file.originalname }
        : {};

      // Parses the request body to create a NewUserRequest object.
      const newUserRequest: NewUserRequest = NewUserRequest.parseJson(request.body);

      // Checks whether a user with the provided email already exists.
      console.log(`-> Checking user is already exits with this ${newUserRequest.email} email address or not.`);
      const existingUser = await UserService.getUserByEmail(newUserRequest.email);
      if (existingUser) {
        console.log(
          `-> User with this ${newUserRequest.email} email address is already exists. Stopping the execution.`
        );
        throw new Error(
          `Error creating a new user. A user already exists with this ${newUserRequest.email} email address.`
        );
      }

      // Creates the new user and generates a token.
      const token = await this.userService.createUser(newUserRequest);

      // Returns a success response with the generated token.
      return response.status(201).json({
        status: 'success',
        message: 'User created successfully.',
        data: { token },
      });
    } catch (error: any) {
      console.log('-> Error while creating user: ', error);
      return response.status(400).json({
        status: 'failed',
        message: error?.message,
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
      // Check wheather user is already exists or not
      const existingUser = await UserService.getUserByEmail(request.body.email);
      if (!existingUser) {
        throw new Error(
          `Can't find user with this email ${request.body.email} address. First register and try to login`
        );
      }

      // Attempt to log the user in and generate a token
      const token = await this.userService.loginUser(existingUser, request.body.password);

      return response.status(200).json({ status: 'success', token });
    } catch (error: any) {
      console.log('-> Error while login a user : ', error);
      return response.status(400).json({
        status: 'fail',
        message: error.message,
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

      return response.status(200).json({ status: 'success', message: 'Password update successfully' });
    } catch (error: any) {
      console.log('-> updateUserPassword Error : ', error);
      return response.status(400).json({
        status: 'fail',
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
      console.log('-> Error while forgot password : ', error);
      return response.status(400).json({
        status: 'fail',
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
      console.log('-> Error while reset user password : ', error);
      return response.status(400).json({
        status: 'fail',
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
      console.log('-> getCurrentUser Error : ', error);
      return response.status(400).json({
        status: 'fail',
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
      // If no file is uploaded, the profileImageUrl will be an empty object.
      request.body.profileImageUrl = request.file
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
      console.log('-> Error while updating user`s profile image: ', error);

      return response.status(400).json({
        status: 'failed',
        message: error?.message,
      });
    }
  }
}
