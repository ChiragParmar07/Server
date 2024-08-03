import mongoose, { Document, Model, Schema } from 'mongoose';
import bcryptjs from 'bcryptjs';
import { GENDER, ROLES, USER_STATUS } from '../../constants/key.constants';
import { GlobleMiddleware } from '../../middlewares/globle.middleware';
import { NewUserRequest } from './new-user-request.model';

export interface UserDocument extends Document {
  _id: string;
  name: string;
  gender: GENDER;
  profileImage: any;
  phone: Number;
  userName: string;
  email: string;
  password: string;
  role: ROLES;
  status: USER_STATUS;
  passwordChangedAt: Date;
  passwordResetToken: string;
  passwordResetExpires: Number;
  lastLoginDate: Date;
  loginCount: Number;
  deleted: Boolean;
  deletedBy: string;
  deletedReason: string;
  deletedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<UserDocument> = new Schema<UserDocument>({
  _id: {
    type: 'string',
    required: true,
  },
  name: {
    type: 'string',
    required: true,
    trim: true,
  },
  gender: {
    type: 'string',
    required: true,
    enum: GENDER,
  },
  profileImage: {
    type: 'object',
  },
  phone: {
    type: 'Number',
    required: true,
    unique: true,
  },
  userName: {
    type: 'string',
    required: true,
    unique: true,
  },
  email: {
    type: 'string',
    required: true,
    unique: true,
  },
  password: {
    type: 'string',
    required: true,
    min: 8,
    max: 16,
  },
  role: {
    type: 'string',
    required: true,
    default: ROLES.USER,
    enum: ROLES,
  },
  status: {
    type: 'string',
    default: USER_STATUS.ACTIVE,
    required: true,
    enum: USER_STATUS,
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: 'string',
  },
  passwordResetExpires: {
    type: 'Number',
  },
  lastLoginDate: {
    type: 'Date',
    required: true,
    default: new Date(),
  },
  loginCount: {
    type: 'Number',
    required: true,
    default: 1,
  },
  deleted: {
    type: 'Boolean',
    required: true,
    default: false,
  },
  deletedBy: {
    type: 'string',
  },
  deletedReason: {
    type: 'string',
  },
  deletedDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
});

// User model
export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>('user', userSchema);

export class User {
  public _id: string;
  public name: string;
  public gender: GENDER;
  public profileImage: any;
  public phone: Number;
  public userName: string;
  public email: string;
  public password: string;
  public role: ROLES;
  public status: USER_STATUS;
  public passwordChangedAt: Date;
  public passwordResetToken: string;
  public passwordResetExpires: Number;
  public lastLoginDate: Date;
  public loginCount: Number;
  public deleted: Boolean;
  public deletedBy: string;
  public deletedReason: string;
  public deletedDate: Date;
  public createdAt: Date;
  public updatedAt: Date;
  public static PASSWORD_ENCRYPT_LEVEL: number;

  constructor() {
    User.PASSWORD_ENCRYPT_LEVEL = Number(process.env.PASSWORD_ENCRYPT_LEVEL);
  }

  /**
   * This method is used to create a new user payload from the provided request body.
   * It hashes the password using bcryptjs and sets other required fields.
   *
   * @param body - The request body containing the user details.
   * @returns A promise that resolves to a new User object with the provided details.
   */
  public static async getNewUserPayload(body: NewUserRequest): Promise<User> {
    const user = new User();

    user._id = GlobleMiddleware.genrateId();
    user.name = body.name;
    user.gender = body.gender;
    user.profileImage = body?.profileImage;
    user.phone = body.phone;
    user.userName = body.userName;
    user.email = body.email;
    user.password = await bcryptjs.hash(body.password as string, this.PASSWORD_ENCRYPT_LEVEL);
    user.passwordChangedAt = null;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.deletedBy = null;
    user.deletedReason = null;
    user.deletedDate = null;

    return user;
  }

  /**
   * This static method is used to generate the payload for updating a user's profile image.
   * It returns an object with the necessary MongoDB update operation to set the new profile image URL and update the updatedAt timestamp.
   *
   * @param profileImage - The new profile image URL to be set for the user.
   * @returns An object representing the MongoDB update operation.
   */
  public static getUpdateUserProfileImagePayload(profileImage: any) {
    return {
      $set: {
        profileImage,
        updatedAt: new Date(),
      },
    };
  }

  /**
   * Validates the payload for updating a user's password.
   * This method checks if the payload contains the current password, new password, and confirmation of the new password.
   * It also verifies that the new password and its confirmation match.
   *
   * @param payload - The payload object containing the currentPassword, newPassword, and confirmNewPassword fields.
   * @throws {Error} - Throws an error if any of the required fields are missing or if the new passwords do not match.
   * @returns An object containing the currentPassword and newPassword fields from the payload.
   */
  public static validateUpdatePasswordPaylod(payload: any) {
    if (!payload?.currentPassword) {
      throw new Error('Please Enter current password.');
    } else if (!payload?.newPassword) {
      throw new Error('Please Enter New Password.');
    } else if (!payload?.confirmNewPassword) {
      throw new Error('Please Enter confirm new password.');
    } else if (payload.newPassword !== payload.confirmNewPassword) {
      throw new Error("The 'New Password' and 'Confirm New Password' are not match");
    }

    return {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    };
  }

  /**
   * Generates an update payload for a user's password.
   * This method hashes the provided password using bcryptjs and sets the updatedAt field to the current date.
   *
   * @param password - The new password to be hashed and set in the update payload.
   * @returns A promise that resolves to an object containing the hashed password and updatedAt field.
   */
  public static async getUpdatePasswordPayload(password: string): Promise<any> {
    const updateModel: any = {
      password: await bcryptjs.hash(password, Number(process.env.PASSWORD_ENCRYPT_LEVEL)),
      updatedAt: new Date(),
    };

    return { $set: updateModel };
  }
}
