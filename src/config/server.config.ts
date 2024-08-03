import { injectable } from 'inversify';
import dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * A class to store server configuration
 */
@injectable()
export default class ServerConfig {
  public environment: 'development' | 'staging' | 'production';
  public developerName: string;
  public port: number;
  public dbURL: string;
  public database: string;

  /**
   * Constructor
   */
  constructor() {}

  public initialize(): void {
    // Set the developer name
    this.developerName = process.env.DEVELOPER_NAME || 'unknown';

    // Set the node environment
    const nodeEnvironment = process.env.NODE_ENV;
    switch (nodeEnvironment?.trim()) {
      case 'production':
        this.environment = 'production';
        break;
      case 'staging':
        this.environment = 'staging';
        break;
      default:
        this.environment = 'development';
        break;
    }

    // Set the port
    this.port = Number(process.env.PORT) || 5050;

    //Connect with MongoDB
    const mongodbUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
    this.database = process.env.MONGODB_DATABASE_NAME || 'Test';
    this.dbURL = mongodbUrl + this.database;
    this.initializeMongoDb();
  }

  /**
   * Initializes the MongoDB connection.
   *
   * @param dbName - The name of the database to connect to.
   * @param dbUri - The URI of the MongoDB server, with a placeholder for the password.
   */
  private initializeMongoDb() {
    mongoose.set('strictQuery', true);
    mongoose
      .connect(this.dbURL)
      .then(() => {
        console.log('===== MongoDB Connected =====');
      })
      .catch((error) => console.log('===== Error while connection to MongoDB => ', error));
  }
}
