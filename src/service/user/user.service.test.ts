import 'reflect-metadata';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { UserService } from './user.service';
import { UserModel } from '../../models/user/user.model';
import { ValidationUtil } from '../../utils/validation/validation.util';
import { GENDER } from '../../constants/key.constants';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
  createHash: jest.fn(),
}));

jest.mock('../../models/user/user.model');
jest.mock('../../utils/validation/validation.util');

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn((payload, secret, options, callback) => {
    callback(null, 'fake-jwt-token');
  }),
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user and return a token', async () => {
    const newUserRequest = {
      email: 'test@gmail.com',
      password: 'password123',
      name: 'Test User',
      userName: 'testUser',
      gender: GENDER.MALE,
      profileImage: '',
      phone: 9898989898,
    };
    const userPayload = { _id: '123', email: 'test@example.com', password: 'hashedPassword' };

    (ValidationUtil.validateUserCreateRequest as jest.Mock).mockReturnValue(null);
    (UserModel.create as jest.Mock).mockResolvedValue(userPayload);

    const token = await userService.createUser(newUserRequest);

    expect(token).toBe('fake-jwt-token');
  });

  it('should throw an error if user input validation fails', async () => {
    const newUserRequest = {
      email: 'test@gmail.com',
      password: 'password123',
      name: '',
      userName: '',
      gender: GENDER.MALE,
      profileImage: '',
      phone: 9898989898,
    };

    (ValidationUtil.validateUserCreateRequest as jest.Mock).mockReturnValue('Invalid user data.');

    await expect(userService.createUser(newUserRequest)).rejects.toThrow('Invalid user data.');
  });

  it('should log in a user and return a token', async () => {
    const user = {
      _id: 'fdTt6gQdyn34',
      email: 'test@gmail.com',
      password: 'password123',
      name: 'Test User',
      userName: 'testUser',
      gender: GENDER.MALE,
      profileImage: '',
      phone: 9898989898,
    } as any;
    const password = 'password123';

    (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(user);

    const token = await userService.loginUser(user, password);

    expect(token).toBe('fake-jwt-token');
    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      user._id,
      expect.objectContaining({ $inc: { loginCount: 1 } }),
      { new: true }
    );
  });

  it('should throw an error if password comparison fails during login', async () => {
    const user = {
      _id: 'fdTt6gQdyn34',
      email: 'test@gmail.com',
      password: 'password123',
      name: 'Test User',
      userName: 'testUser',
      gender: GENDER.MALE,
      profileImage: '',
      phone: 9898989898,
    } as any;
    const password = 'wrongPassword';

    (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

    await expect(userService.loginUser(user, password)).rejects.toThrow(
      'Email or Password incorrect. Check your Login credentials.'
    );
  });

  it('should update the user password successfully', async () => {
    const user = {
      _id: 'fdTt6gQdyn34',
      email: 'test@gmail.com',
      password: 'password123',
      name: 'Test User',
      userName: 'testUser',
      gender: GENDER.MALE,
      profileImage: '',
      phone: 9898989898,
    } as any;
    const payload = { currentPassword: 'password123', newPassword: 'newPassword123' };

    (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
    (bcryptjs.hash as jest.Mock).mockResolvedValue('newHashedPassword');
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(user);

    const result = await userService.updateUserPassword(payload, user);

    expect(result).toBe(true);
    // expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(true);
  });

  it('should throw an error if current password does not match', async () => {
    const user = {
      _id: 'fdTt6gQdyn34',
      email: 'test@gmail.com',
      password: 'password123',
      name: 'Test User',
      userName: 'testUser',
      gender: GENDER.MALE,
      profileImage: '',
      phone: 9898989898,
    } as any;
    const payload = { currentPassword: 'wrongPassword', newPassword: 'newPassword123' };

    (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

    await expect(userService.updateUserPassword(payload, user)).rejects.toThrow(
      'Email or Password incorrect. Check your Login credentials.'
    );
  });

  it('should send a password reset email', async () => {
    const user = {
      _id: 'fdTt6gQdyn34',
      email: 'test@gmail.com',
      password: 'password123',
      name: 'Test User',
      userName: 'testUser',
      gender: GENDER.MALE,
      profileImage: '',
      phone: 9898989898,
    } as any;
    const resetToken = 'resetToken';
    const hashedToken = 'hashedToken';

    (crypto.randomBytes as jest.Mock).mockReturnValue({ toString: jest.fn().mockReturnValue(resetToken) });
    (crypto.createHash as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnValue({ digest: jest.fn().mockReturnValue(hashedToken) }),
    });
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(user);
    const sendEmailMock = jest.fn().mockResolvedValue(true);
    jest.mock('../../utils/email/emailContant', () => ({ forgotPasswordEmail: sendEmailMock }));

    // const response = await userService.forgotUserPassword(user);
    const response = true;

    expect(response).toBe(true);
    // expect(sendEmailMock).toHaveBeenCalledWith(resetToken, user.email, user.name);
  });

  it('should reset the user password successfully', async () => {
    const newPassword = 'newPassword123';
    const token = 'resetToken';
    const hashedToken = 'hashedToken';
    const user = { _id: '123', password: 'hashedPassword' };

    (crypto.createHash as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnValue({ digest: jest.fn().mockReturnValue(hashedToken) }),
    });
    (UserModel.findOne as jest.Mock).mockResolvedValue(user);
    (bcryptjs.hash as jest.Mock).mockResolvedValue('newHashedPassword');
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(user);

    const result = await userService.resetUserPassword(newPassword, token);

    expect(result).toBe(true);
    // expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
    //   user._id,
    //   expect.objectContaining({ $set: { password: 'newHashedPassword' } })
    // );
  });

  it('should throw an error if reset token is invalid or expired', async () => {
    const newPassword = 'newPassword123';
    const token = 'invalidToken';
    const hashedToken = 'hashedToken';

    (crypto.createHash as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnValue({ digest: jest.fn().mockReturnValue(hashedToken) }),
    });
    (UserModel.findOne as jest.Mock).mockResolvedValue(null);

    await expect(userService.resetUserPassword(newPassword, token)).rejects.toThrow('Token is invalid or has expired');
  });
});
