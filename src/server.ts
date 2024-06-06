import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import * as path from 'path';
import { RequestHandler } from 'express-serve-static-core';
import { iocContainer } from './inversify.config';

import './controller/index';
import ServerConfig from './config/server.config';

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

  // app.use(bodyParser.text() as RequestHandler);
  // app.use(bodyParser.json({ limit: '50mb' }) as RequestHandler);
  // app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }) as RequestHandler);
  const cacheTime = 31536000;
  app.use(express.static('assets', { maxAge: cacheTime }) as RequestHandler);
});

const app = server.build();
app.listen(app.get('port'), () => {
  console.log(
    `========== Server is running on port ${app.get('port')}, ${app.get('env')}, ${
      serverConfig.developerName
    } ==========`
  );
});
