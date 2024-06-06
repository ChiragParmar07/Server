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
  public database: { defaultDatabase: string };

  /**
   * Constructor
   */
  constructor() {
    this.database = {
      defaultDatabase: '',
    };
  }

  public initialize(): void {
    // Set the developer name
    this.developerName = process.env.DEVELOPER_NAME;

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

    //Connect with MongoDB
    this.database.defaultDatabase = process.env.MONGODB_DATABASE_NAME || 'Test';
    this.initializeMongoDb(this.database.defaultDatabase, process.env.MONGODB_URL);

    // Set the port
    this.port = parseInt(process.env.PORT) || 4100;
  }

  /**
   * Initializes the MongoDB connection.
   *
   * @param dbName - The name of the database to connect to.
   * @param dbUri - The URI of the MongoDB server, with a placeholder for the password.
   */
  private initializeMongoDb(dbName: string, dbUri: string) {
    const dbUrl: any = dbUri?.replace('<password>', process.env.MONGODB_PASSWORD) + dbName;

    mongoose.set('strictQuery', true);
    mongoose
      .connect(dbUrl)
      .then(() => {
        console.log('===== MongoDB Connected =====');
      })
      .catch((error) => console.log('===== Error while connection to MongoDB => ', error));
  }
}
