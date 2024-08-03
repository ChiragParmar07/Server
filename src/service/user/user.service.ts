import { injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import moment from 'moment';
import { User, UserModel } from '../../models/user/user.model';
import { UserDocument } from '../../models/user/user.model';
import { ValidationUtil } from '../../utils/validation/validation.util';
import { NewUserRequest } from '../../models/user/new-user-request.model';
import { forgotPasswordEmail } from '../../utils/email/emailContant';
import { UploadUtil } from '../../utils/upload/upload.util';

@injectable()
export class UserService {
  public jwt_secret: string;
  public jwt_expire: string;
  public createhash_key: string;
  public password_encrypt_level: number;

  constructor() {
    this.jwt_secret = process.env.JWT_SECRET;
    this.jwt_expire = process.env.JWT_EXPIRES_IN;
    this.createhash_key = process.env.CREATEHASH_KEY;
    this.password_encrypt_level = Number(process.env.PASSWORD_ENCRYPT_LEVEL);
  }

  /**
   * Asynchronously retrieves a user by their email address.
   *
   * This method queries the database for a user document that matches the provided email address.
   * If a user is found, it returns the user document. If no user is found or an error occurs,
   * the method throws an error.
   *
   * @param email The email address of the user to retrieve.
   * @returns A promise that resolves to the `UserDocument` of the found user.
   * @throws Will throw an error if the query fails or no user is found.
   */
  public static async getUserByEmail(email: string): Promise<UserDocument> {
    try {
      return await UserModel.findOne({ email });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Asynchronously deletes a user by their id.
   *
   * This method queries the database for a user document that matches the provided id
   * and deletes it. If the user is successfully deleted, it returns true.
   *
   * @param id The id address of the user to delete.
   * @returns A promise that resolves return true.
   * @throws Will throw an error if the query fails.
   */
  public async deleteUserById(id: string): Promise<Boolean> {
    try {
      await UserModel.findByIdAndDelete(id);

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Inserts a new user into the database.
   *
   * This method takes a `User` object as a payload and attempts to create a new user document in the database
   * using the `UserModel`. If the operation is successful, it returns the created `UserDocument`. If an error
   * occurs during the operation, it throws the encountered error.
   *
   * @param payload The `User` object containing the new user's information.
   * @returns A promise that resolves to the created `UserDocument`.
   * @throws An error if the user creation process fails.
   */
  public async insertNewUser(payload: User): Promise<UserDocument> {
    try {
      return await UserModel.create(payload);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates a user in the database.
   *
   * @param userId The ID of the user to update.
   * @param updateModel The model containing the updated user information.
   * @returns The updated user document.
   * @throws An error if the user update process fails.
   */
  public async updateUserById(userId: any, updateModel: any): Promise<UserDocument> {
    try {
      return await UserModel.findByIdAndUpdate(userId, updateModel, { new: true });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Asynchronously finds a user in the database based on the provided filter.
   *
   * This method queries the database for a user document that matches the provided filter.
   * If a user is found, it returns the user document. If an error occurs,
   * the method throws an error.
   *
   * @param filter The filter object used to search for the user in the database.
   * @returns A promise that resolves to the `UserDocument` of the found user.
   * @throws Will throw an error if the query fails or no user is found.
   */
  public async findUserByFilter(filter: any): Promise<UserDocument> {
    try {
      return await UserModel.findOne(filter);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates a new user in the database and generates a JWT token for the user.
   *
   * This method validates the user input, creates a new user payload, inserts the new user into the database,
   * and generates a JWT token for the newly created user.
   *
   * @param newUserRequest The request object containing the new user's information.
   * @returns A promise that resolves to a JWT token string if the user creation and token generation are successful.
   * @throws An error if the user input validation fails, user creation fails, or token generation fails.
   */
  public async createUser(newUserRequest: NewUserRequest): Promise<any> {
    let user: UserDocument;
    try {
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: Creating payload for new user.`);
      // Create payload for insert new record
      const payload = await User.getNewUserPayload(newUserRequest);

      // Insert new user in database
      user = await this.insertNewUser(payload);
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: New user created successfully.`);
      user.password = null;

      // Generate token
      const token = await this.tokenGenerate({ id: user._id, email: user.email });
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: Token generated successfully.`);

      return { token, user };
    } catch (error) {
      console.error(
        `${moment().format('YYYY-MM-DD HH:mm:ss')}: Failed to create user. so delete user if already creared.`
      );
      await this.deleteUserById(user?._id);

      throw error;
    }
  }

  /**
   * Authenticates a user and generates a JWT token if authentication is successful.
   *
   * This method first verifies the provided password against the user's stored password.
   * If the password matches, it increments the user's login count and updates the last login date.
   * Finally, it generates a JWT token using the user's ID and email, which is returned to the caller.
   *
   * @param user The `UserDocument` object representing the user attempting to log in.
   * @param password The plain text password provided by the user for login.
   * @returns A promise that resolves to a JWT token string if authentication is successful.
   * @throws An error if the password comparison fails or if there is an issue updating the user's login information.
   */
  public async loginUser(user: UserDocument, password: string): Promise<string> {
    try {
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: Comparing passwords...`);
      // Compare given password against current password and return true if present otherwise return false
      await this.comparePassword(password, user.password);

      // Update user login count
      const updateModel = {
        $inc: { loginCount: 1 }, // Increase login count by 1
        $set: {
          lastLoginDate: new Date(), // Set the lastLoginDate to the current date
          updatedAt: new Date(),
        },
      };
      await this.updateUserById(user._id, updateModel);

      // Generate JWT Token
      const token = await this.tokenGenerate({ id: user._id, email: user.email });
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: Token generated successfully.`);

      return token;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates the password of a specified user.
   *
   * This method first verifies the current password provided by the user against the stored password in the database.
   * If the password matches, it proceeds to update the user's password with the new password provided in the payload.
   * The new password is first transformed according to the application's password policy before being updated in the database.
   *
   * @param payload An object containing the current and new passwords.
   * @param user The `UserDocument` object representing the user whose password is to be updated.
   * @returns A Promise that resolves to `true` if the password update is successful.
   * @throws An error if the current password does not match the stored password or if the update operation fails.
   */
  public async updateUserPassword(payload: any, user: UserDocument) {
    try {
      const { currentPassword, newPassword } = payload;

      // Check new password is valid or not
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: Validating user inputs...`);
      const invalidPayloadMessage = ValidationUtil.validatePassword(newPassword);
      if (invalidPayloadMessage) {
        console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: Password is not valid. Stopping the execution.`);
        throw new Error(invalidPayloadMessage);
      }

      // Compare given password against current password and return true if present otherwise return false
      await this.comparePassword(currentPassword, user.password);

      // Get update user password model
      const updateModel = await User.getUpdatePasswordPayload(newPassword);

      // Update user password
      await this.updateUserById(user._id, updateModel);

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates a new password reset token, updates the user's document with the token and expiration date,
   * and sends a password reset email to the user.
   *
   * @param user The UserDocument object representing the user for whom the password reset is requested.
   * @returns A promise that resolves to true if the password reset process is successful.
   * @throws An error if there is an issue generating the reset token, updating the user's document, or sending the email.
   */
  public async forgotUserPassword(user: UserDocument): Promise<any> {
    let passwordResetToken: string;
    let passwordResetExpires: Number;
    try {
      // Create resetToken
      const resetToken = crypto.randomBytes(32).toString('hex');

      passwordResetToken = crypto.createHash(this.createhash_key).update(resetToken).digest('hex'); // Encrypt resetToken
      passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expire reset password reset token in 10 minutes

      const updateModel = {
        $set: {
          passwordResetToken,
          passwordResetExpires,
          updatedAt: new Date(),
        },
      };
      await this.updateUserById(user._id, updateModel);

      // Send mail to the user
      await forgotPasswordEmail(resetToken, user.email, user.name);

      return true;
    } catch (error) {
      // If error occues update user model with passwordresettoken and passwordresetexpires to undefined
      passwordResetToken = undefined;
      passwordResetExpires = undefined;

      const updateModel = {
        $set: {
          passwordResetToken,
          passwordResetExpires,
          updatedAt: new Date(),
        },
      };
      await this.updateUserById(user._id, updateModel);

      throw error;
    }
  }

  /**
   * Resets a user's password given a valid reset token and a new password.
   *
   * This method first hashes the provided token to match the stored format in the database. It then
   * searches for a user with a matching `passwordResetToken` that has not expired. If a user is found,
   * the method proceeds to hash the new password and updates the user's password in the database. It also
   * clears the `passwordResetToken` and `passwordResetExpires` fields to invalidate the reset token.
   *
   * @param password The new password provided by the user.
   * @param token The password reset token provided to the user.
   * @returns A promise that resolves to `true` if the password reset process is successful.
   * @throws An error if the reset token is invalid, has expired, or if any other issue occurs during the process.
   */
  public async resetUserPassword(password: string, token: string) {
    try {
      const hashedToken = crypto.createHash(this.createhash_key).update(token).digest('hex');

      // Find user with filter
      const filter = {
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      };
      const user = await this.findUserByFilter(filter);

      if (!user) {
        throw new Error('Token is invalid or has expired');
      }

      const hashedPassword = await bcryptjs.hash(password as string, this.password_encrypt_level);
      const passwordResetToken = undefined;
      const passwordResetExpires = undefined;

      // Update user password
      const updateModel = {
        $set: {
          password: hashedPassword,
          passwordResetToken,
          passwordResetExpires,
          updatedAt: new Date(),
        },
      };
      await this.updateUserById(user._id, updateModel);

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Asynchronously updates the profile image of a user.
   *
   * This method takes a request body containing the user's ID and the new profile image URL,
   * constructs an update payload, and updates the user's profile image in the database.
   *
   * @param body An object containing the user's ID and the new profile image URL.
   * @param body.userId The ID of the user whose profile image is to be updated.
   * @param body.profileImage The new profile image URL to be set for the user.
   * @throws Will throw an error if the update process fails.
   */
  public async updateUserProfileImage(body: any) {
    try {
      const payload = User.getUpdateUserProfileImagePayload(body.profileImage);

      await this.updateUserById(body.userId, payload);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generates a JWT token using the provided payload and secret key.
   *
   * @param payload The payload containing the user's Id.
   * @returns A promise that resolves to a JWT token string if token generation is successful.
   * @throws An error if there is an issue generating the JWT token.
   */
  public tokenGenerate(payload: any): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, this.jwt_secret, { expiresIn: this.jwt_expire }, (error, token) => {
        if (error) {
          reject('Error generating JWT token: ' + error.message);
        } else {
          resolve(token);
        }
      });
    });
  }

  /**
   * Compares the given candidatePassword with the user's stored password.
   *
   * @param candidatePassword The plain text password provided by the user for login.
   * @param userPassword The hashed password stored in the database for the user.
   * @returns A Promise that resolves to a boolean value indicating whether the passwords match.
   * @throws An error if the password comparison fails.
   */
  public async comparePassword(candidatePassword: string, userPassword: string): Promise<Boolean> {
    const response = await bcryptjs.compare(candidatePassword, userPassword);
    if (response) {
      return true;
    } else {
      throw new Error('Email or Password incorrect. Check your Login credentials.');
    }
  }

  /**
   * Deletes the uploaded profile image from the S3 bucket.
   *
   * This function checks if a file object is provided and contains a 'key' property.
   * If the condition is met, it logs a message indicating the deletion process,
   * and then calls the `deleteImage` method from the `UploadUtil` class to remove the image from the S3 bucket.
   *
   * @param file - The file object containing the S3 key of the uploaded profile image.
   * @returns A promise that resolves to `true` if the image deletion is successful, or rejects with an error if the deletion fails.
   * @throws Will throw an error if the deletion process fails.
   */
  public async deleteUploadedProfileImage(file) {
    try {
      if (Object.keys(file).length > 0) {
        console.log(
          `${moment().format('YYYY-MM-DD HH:mm:ss')}: Deleting profile image which is already uploaded in s3 bucket`
        );

        await UploadUtil.deleteImage(file['key']);
      }

      return true;
    } catch (error) {
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')}: Error occurs while deleteting uploded profile image.`);
      return false;
    }
  }
}
