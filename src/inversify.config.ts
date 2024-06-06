import { Container } from 'inversify';
import TYPES from './constants/types.constants';
import ServerConfig from './config/server.config';
import { UserService } from './service/user/user.service';

export const iocContainer = new Container();

iocContainer.bind<ServerConfig>(ServerConfig).to(ServerConfig).inSingletonScope();
iocContainer.bind<UserService>(TYPES.UserService).to(UserService).inSingletonScope();
