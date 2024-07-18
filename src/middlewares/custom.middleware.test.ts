import 'reflect-metadata';
import { CustomMiddleware } from './custom.middleware'; // Adjust the path as necessary
import jwt from 'jsonwebtoken';
import { UserService } from '../service/user/user.service';

jest.mock('jsonwebtoken');
jest.mock('../service/user/user.service');

describe('CustomMiddleware', () => {
  const mockRequest = (headers: any, body: any) => ({
    headers,
    body,
  });

  const mockResponse = () => {
    const res = {} as any;
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res;
  };

  const nextFunction = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no token is provided', async () => {
    const req = mockRequest({}, {});
    const res = mockResponse();

    await CustomMiddleware.UserAuthMiddleware(req, res, nextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'You are not logged in! Login to get access.',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    const req = mockRequest(
      {
        authorization: 'Bearer invalidToken',
      },
      {}
    );
    const res = mockResponse();
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });

    await CustomMiddleware.UserAuthMiddleware(req, res, nextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'You are not authenticated!',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if user does not exist', async () => {
    const req = mockRequest(
      {
        authorization: 'Bearer validToken',
      },
      {}
    );
    const res = mockResponse();
    (jwt.verify as jest.Mock).mockReturnValue({ email: 'test@example.com', id: '123' });
    (UserService.getUserByEmail as jest.Mock).mockResolvedValue(null);

    await CustomMiddleware.UserAuthMiddleware(req, res, nextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'The user belonging to this token does no longer exist.',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if user is deleted', async () => {
    const req = mockRequest(
      {
        authorization: 'Bearer validToken',
      },
      {}
    );
    const res = mockResponse();
    (jwt.verify as jest.Mock).mockReturnValue({ email: 'test@example.com', id: '123' });
    (UserService.getUserByEmail as jest.Mock).mockResolvedValue({ deleted: true });

    await CustomMiddleware.UserAuthMiddleware(req, res, nextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'The user belonging to this token has been deleted.',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should call next() and attach user data if all checks pass', async () => {
    const req = mockRequest(
      {
        authorization: 'Bearer validToken',
      },
      {}
    );
    const res = mockResponse();
    const mockUser = { _id: '123', email: 'test@example.com', deleted: false };
    (jwt.verify as jest.Mock).mockReturnValue({ email: 'test@example.com', id: '123' });
    (UserService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

    await CustomMiddleware.UserAuthMiddleware(req, res, nextFunction);

    expect(req['userData']).toEqual({ email: 'test@example.com', id: '123' });
    expect(req['currentUser']).toEqual(mockUser);
    expect(req.body.userId).toBe('123');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should handle token expiration', async () => {
    const req = mockRequest(
      {
        authorization: 'Bearer validToken',
      },
      {}
    );
    const res = mockResponse();
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('jwt expired');
    });

    await CustomMiddleware.UserAuthMiddleware(req, res, nextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token Expired! Login to get access.',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
