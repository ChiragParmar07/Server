import { isEmpty } from 'lodash';
import { NewUserRequest } from '../../models/user/new-user-request.model';
import { userName_regex, email_regex, only_alphabets_regex, only_numbers } from './regex/regex.util';
import { gender } from '../../constants/key.constants';

export class ValidationUtil {
  /**
   * Validates the user creation request data.
   *
   * This method performs various checks to ensure that the data provided for a new user
   * meets specific criteria, such as non-empty fields, adherence to specific formats for
   * usernames, emails, and phone numbers, and password requirements.
   *
   * @param newUserRequest The user data to validate, encapsulated in a `NewUserRequest` object.
   * @returns A string message indicating the validation error. If validation passes, an empty string is returned.
   */
  public static validateUserCreateRequest(newUserRequest: NewUserRequest): string {
    // Name validation
    if (isEmpty(newUserRequest.name) || !newUserRequest.name.trim()) {
      return "Name can't be blank";
    }
    if (!only_alphabets_regex.test(newUserRequest.name)) {
      return 'Name can only contain alphabets';
    }

    // userName validation
    if (isEmpty(newUserRequest.userName) || !newUserRequest.userName.trim()) {
      return "UserName can't be blank";
    }
    if (!userName_regex.test(newUserRequest.userName)) {
      return 'UserName can only contain alphabets, numbers and special characters(-.)';
    }

    // gender validation
    if (isEmpty(newUserRequest.gender) || !newUserRequest.gender.trim()) {
      return "Gender can't be blank";
    }
    if (!gender.includes(newUserRequest.gender)) {
      return 'please select valid gender';
    }

    // email validation
    if (isEmpty(newUserRequest.email) || !newUserRequest.email.trim()) {
      return "email can't be blank";
    }
    if (!email_regex.test(newUserRequest.email)) {
      return 'Invalid email address';
    }

    // Phone number validation
    if (isEmpty(newUserRequest.phone?.toString()) || !newUserRequest.phone?.toString().trim()) {
      return "Phone number can't be blank";
    }
    if (newUserRequest.phone?.toString().trim().length !== 10) {
      return 'Phone number must be at least 10 characters';
    }
    if (!only_numbers.test(newUserRequest.phone?.toString())) {
      return 'Phone number must be digits';
    }

    // password validation
    if (isEmpty(newUserRequest.password) || !newUserRequest.password.trim()) {
      return "password can't be blank";
    }
    if (!/(?=.*[a-z])/.test(newUserRequest.password)) {
      return 'Password must contain a lower case letter';
    }
    if (!/(?=.*[A-Z])/.test(newUserRequest.password)) {
      return 'Password must contain an upper case letter';
    }
    if (!/(?=.*[0-9])/.test(newUserRequest.password)) {
      return 'Password must contain a number';
    }
    if (!/(?=.[!@#%&$*|_\^])/.test(newUserRequest.password)) {
      return 'Password must contain a special character';
    }

    return '';
  }

  /**
   * Validates a password according to specific criteria.
   *
   * This method checks if the provided password meets the following requirements:
   * - It is not empty or whitespace.
   * - It contains at least one lowercase letter.
   * - It contains at least one uppercase letter.
   * - It contains at least one digit.
   * - It contains at least one special character from the set [!@#%&$*|_\^].
   *
   * @param password - The password to validate.
   * @returns A string message indicating the validation error. If validation passes, an empty string is returned.
   */
  public static validatePassword(password: string): string {
    if (isEmpty(password) || !password.trim()) {
      return "password can't be blank";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain a lower case letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain an upper case letter';
    }
    if (!/(?=.*[0-9])/.test(password)) {
      return 'Password must contain a number';
    }
    if (!/(?=.[!@#%&$*|_\^])/.test(password)) {
      return 'Password must contain a special character';
    }

    return '';
  }
}
