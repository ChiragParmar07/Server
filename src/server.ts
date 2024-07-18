import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import helmet from 'helmet';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import * as path from 'path';
import { RequestHandler } from 'express-serve-static-core';
import { iocContainer } from './inversify.config';
import ServerConfig from './config/server.config';
import './controller/index';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const server = new InversifyExpressServer(iocContainer);

// Initialize the server configuration
const serverConfig = iocContainer.get<ServerConfig>(ServerConfig);
serverConfig.initialize();

server.setConfig((app: express.Application) => {
  // app.use(express.json());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

  app.use(cors());
  app.use(morgan('dev'));
  app.use(helmet());
  app.set('port', serverConfig.port);

  const cacheTime = 31536000;
  app.use(express.static('assets', { maxAge: cacheTime }) as RequestHandler);
});

const app = server.build();

app.get('/', (req, res) => {
  try {
    res.status(200).json({ message: 'Hello, World!' });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(app.get('port'), () => {
  console.log(
    `========== Server is running on port ${app.get('port')}, ${app.get('env')}, ${
      serverConfig.developerName
    } ==========`
  );
});
