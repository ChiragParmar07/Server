import { GENDER } from '../../constants/key.constants';

/**
 * A class to transfer new user request details
 */
export class NewUserRequest {
  public name: string;
  public userName: string;
  public email: string;
  public gender: GENDER;
  public phone: Number;
  public profileImageUrl: any;
  public password: string;

  /**
   * Parses a JSON object into a `NewUserRequest` instance.
   * This method initializes a new `NewUserRequest` with default values,
   * then overrides those values with any matching properties found in the provided JSON object.
   * Fields like `email` are processed to ensure they meet specific criteria (e.g., lowercase for email).
   *
   * @param jsonObject An object potentially containing properties matching the `NewUserRequest` class.
   * If `null` or `undefined`, a new `NewUserRequest` with default values is returned.
   * @returns A `NewUserRequest` instance populated with the values from the `jsonObject` if provided,
   * otherwise a new instance with default values.
   */
  public static parseJson(jsonObject: any): NewUserRequest {
    const newUserRequest: NewUserRequest = new NewUserRequest();

    if (!jsonObject) {
      return newUserRequest;
    }

    newUserRequest.name = jsonObject.name;
    newUserRequest.userName = jsonObject.userName;
    newUserRequest.gender = jsonObject.gender;
    newUserRequest.email = jsonObject.email?.toLowerCase();
    newUserRequest.phone = jsonObject.phone;
    newUserRequest.profileImageUrl = jsonObject?.profileImageUrl ? jsonObject.profileImageUrl : '';
    newUserRequest.password = jsonObject.password;

    return newUserRequest;
  }
}
