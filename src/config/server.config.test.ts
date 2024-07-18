import 'reflect-metadata';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ServerConfig from './server.config';

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(undefined),
  set: jest.fn(),
}));

describe('ServerConfig', () => {
  let serverConfig: ServerConfig;

  beforeAll(() => {
    // Mocking environment variables
    process.env.DEVELOPER_NAME = 'Test Developer';
    process.env.NODE_ENV = 'development';
    process.env.MONGODB_DATABASE_NAME = 'TestDB';
    process.env.MONGODB_URL = 'mongodb://localhost:27017/<password>/';
    process.env.MONGODB_PASSWORD = 'testpassword';
    process.env.PORT = '4100';

    // Initialize dotenv configuration
    dotenv.config();
  });

  beforeEach(() => {
    serverConfig = new ServerConfig();
    serverConfig.initialize();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with the correct environment', () => {
    expect(serverConfig.environment).toBe('development');
  });

  it('should set the developer name from environment variables', () => {
    expect(serverConfig.developerName).toBe('Test Developer');
  });

  it('should set the port correctly', () => {
    expect(serverConfig.port).toBe(4100);
  });

  it('should connect to MongoDB with the correct URL', () => {
    expect(mongoose.set).toHaveBeenCalledWith('strictQuery', true);
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/testpassword/TestDB');
  });

  it('should default to the Test database if MONGODB_DATABASE_NAME is not provided', () => {
    delete process.env.MONGODB_DATABASE_NAME;
    serverConfig.initialize();
    expect(serverConfig.database.defaultDatabase).toBe('Test');
  });

  //   it('should handle connection errors gracefully', async () => {
  //     (mongoose.connect as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Connection error')));
  //     const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  //     serverConfig.initialize();
  //     expect(consoleLogSpy).toHaveBeenCalledWith('===== Error while connection to MongoDB => ', expect.any(Error));
  //     consoleLogSpy.mockRestore();
  //   });
});
