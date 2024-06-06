import * as dotenv from 'dotenv';
import * as path from 'path';
import jwt from 'jsonwebtoken';
import { UserService } from '../service/user/user.service';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export class CustomMiddleware {
  /**
   * Custom middleware for user authentication.
   * This middleware verifies the JWT token in the request headers,
   * fetches the user data from the database, and attaches it to the request object.
   *
   * @param req - The request object containing headers and body.
   * @param res - The response object to send back in case of errors.
   * @param next - The next middleware function in the request-response cycle.
   *
   * @returns {Promise<void>} - A promise that resolves when the middleware is completed.
   */
  public static async UserAuthMiddleware(req: any, res: any, next: any) {
    try {
      let token;

      // Extract the JWT token from the request headers
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      // If no token is provided, return an unauthorized response
      if (!token) {
        return res.status(401).json({
          message: 'You are not logged in! Login to get access.',
        });
      }

      // Verify the JWT token and extract user data
      const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET as string);
      const email = decodedToken['email'];
      const userId = decodedToken['id'];

      // Attach user data to the request object
      req.userData = { email: email, id: userId };

      // Fetch the current user from the database
      const currentUser = await UserService.getUserByEmail(email);

      // If the user does not exist, return an unauthorized response
      if (!currentUser) {
        return res.status(401).json({
          message: 'The user belonging to this token does no longer exist.',
        });
      }

      // If the user is deleted, return an unauthorized response
      if (currentUser.deleted) {
        return res.status(401).json({
          message: 'The user belonging to this token has been deleted.',
        });
      }

      // Attach the current user to the request object
      req['currentUser'] = currentUser;
      req.body.userId = currentUser._id;

      // Call the next middleware function
      next();
    } catch (error: any) {
      // Handle JWT expiration error
      if (error.message === 'jwt expired') {
        return res.status(401).json({ message: 'Token Expired! Login to get access.' });
      }

      // Handle other authentication errors
      return res.status(401).json({ message: 'You are not authenticated!' });
    }
  }
}
