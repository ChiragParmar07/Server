import { ValidationUtil } from './validation.util'; // Adjust the import path as necessary
import { NewUserRequest } from '../../models/user/new-user-request.model'; // Adjust import as necessary
import { GENDER } from '../../constants/key.constants';

describe('ValidationUtil', () => {
  describe('validateUserCreateRequest', () => {
    it('should return an error message for blank name', () => {
      const request: NewUserRequest = {
        name: '',
        userName: 'user123',
        gender: GENDER.MALE,
        email: 'test@example.com',
        phone: 1234567890,
        password: 'Password1!',
        profileImageUrl: '',
      };
      expect(ValidationUtil.validateUserCreateRequest(request)).toBe("Name can't be blank");
    });

    it('should return an error message for invalid name', () => {
      const request: NewUserRequest = {
        name: '123',
        userName: 'user123',
        gender: GENDER.MALE,
        email: 'test@example.com',
        phone: 1234567890,
        password: 'Password1!',
        profileImageUrl: '',
      };
      expect(ValidationUtil.validateUserCreateRequest(request)).toBe('Name can only contain alphabets');
    });

    it('should return an error message for blank userName', () => {
      const request: NewUserRequest = {
        name: 'John Doe',
        userName: '',
        gender: GENDER.MALE,
        email: 'test@example.com',
        phone: 1234567890,
        password: 'Password1!',
        profileImageUrl: '',
      };
      expect(ValidationUtil.validateUserCreateRequest(request)).toBe("UserName can't be blank");
    });

    it('should return an error message for invalid email', () => {
      const request: NewUserRequest = {
        name: 'John Doe',
        userName: 'user123',
        gender: GENDER.MALE,
        email: 'invalid-email',
        phone: 1234567890,
        password: 'Password1!',
        profileImageUrl: '',
      };
      expect(ValidationUtil.validateUserCreateRequest(request)).toBe('Invalid email address');
    });

    it('should return an error message for invalid phone number', () => {
      const request: NewUserRequest = {
        name: 'John Doe',
        userName: 'user123',
        gender: GENDER.MALE,
        email: 'test@example.com',
        phone: 12345,
        password: 'Password1!',
        profileImageUrl: '',
      };
      expect(ValidationUtil.validateUserCreateRequest(request)).toBe('Phone number must be at least 10 characters');
    });

    it('should return an error message for blank password', () => {
      const request: NewUserRequest = {
        name: 'John Doe',
        userName: 'user123',
        gender: GENDER.MALE,
        email: 'test@example.com',
        phone: 1234567890,
        password: '',
        profileImageUrl: '',
      };
      expect(ValidationUtil.validateUserCreateRequest(request)).toBe("password can't be blank");
    });

    it('should return an error message for weak password', () => {
      const request: NewUserRequest = {
        name: 'John Doe',
        userName: 'user123',
        gender: GENDER.MALE,
        email: 'test@example.com',
        phone: 1234567890,
        password: 'password',
        profileImageUrl: '',
      };
      expect(ValidationUtil.validateUserCreateRequest(request)).toBe('Password must contain an upper case letter');
    });

    it('should return an empty string if validation passes', () => {
      const request: NewUserRequest = {
        name: 'John Doe',
        userName: 'user123',
        gender: GENDER.MALE,
        email: 'test@example.com',
        phone: 1234567890,
        password: 'Password1!',
        profileImageUrl: '',
      };
      expect(ValidationUtil.validateUserCreateRequest(request)).toBe('');
    });
  });

  describe('validatePassword', () => {
    it('should return an error message for blank password', () => {
      expect(ValidationUtil.validatePassword('')).toBe("password can't be blank");
    });

    it('should return an error message for missing lower case letter', () => {
      expect(ValidationUtil.validatePassword('PASSWORD1!')).toBe('Password must contain a lower case letter');
    });

    it('should return an error message for missing upper case letter', () => {
      expect(ValidationUtil.validatePassword('password1!')).toBe('Password must contain an upper case letter');
    });

    it('should return an error message for missing digit', () => {
      expect(ValidationUtil.validatePassword('Password!')).toBe('Password must contain a number');
    });

    it('should return an error message for missing special character', () => {
      expect(ValidationUtil.validatePassword('Password1')).toBe('Password must contain a special character');
    });

    it('should return an empty string if validation passes', () => {
      expect(ValidationUtil.validatePassword('Password1!')).toBe('');
    });
  });
});
