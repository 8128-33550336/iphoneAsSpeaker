import * as https from 'https';
import express from 'express';
import expressWs, { WebsocketRequestHandler } from 'express-ws';
import cors from 'cors';

export const createServer = (option: https.ServerOptions) => {
    const app = express();
    const server = https.createServer(option, app);
    const wsApp = expressWs(app, server).app;
    wsApp.use(express.static('./public'));
    wsApp.use(cors());

    const clients = new Set<Parameters<WebsocketRequestHandler>[0]>();

    wsApp.ws('/', (websocketClient, req) => {
        console.log('ws!');
        clients.add(websocketClient);
        console.log('connect');
        websocketClient.on('message', message => {
            [...clients].filter(v => v !== websocketClient).forEach(client => {
                client.send('' + message);
            });
            console.log('' + message);
        });
        websocketClient.on('close', () => {
            clients.delete(websocketClient);
        });
    });
    return server;
};
