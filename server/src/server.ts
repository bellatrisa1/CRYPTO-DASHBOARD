import { startHttpServer } from './http/httpServer.js';
import { startWsServer } from './ws/wsServer.js';

startHttpServer(3002);
startWsServer(3001);